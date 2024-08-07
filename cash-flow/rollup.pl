#! perl

%standardClass = qw(
Array 1
Date 1
FormData 1
XMLHttpRequest 1
Dygraph 1
RegExp 1
Promise 1
);

$verbose_mode = 0;
$debug_mode = 0;
$do_uglify = 0;
$html_remove_leading_spaces = 0;
#$js_remove_comments = 0;

# ---end-of-configuration-part---

system("mkdir -p build/js");
system("cp -a assets/* build");

build_html() or die;

print("analysing js files ...\n") if $::debug_mode;
my $js_filelist = list_js_files("src");
my $js_filelist_ordered = order_js($js_filelist);
print("writing build/js/app.min.js\n") if $::verbose_mode;     # out of src/main.js
open(my $fh, ">", "build/js/app.min.js") or die;
my $js_raw = "{#JS_VAR#}\n";
$js_raw .= concat_files($js_filelist_ordered);

# append diversion that declares variables
$js_raw .= qq({#JS_VAR#:\n);
for my $comp (@components) {
    # var loggingTabComponent = null
    $js_raw .= "var " . comp_to_var($comp) . " = null\n"
}
$js_raw .= qq(:##}\n);

# append diversion that instantiates the components
$js_raw .= qq({#JS_CREATES#:\n);
for my $comp (@components) {
    # loginPopupComponent = new LoginPopupComponent()
    # components.push(loginPopupComponent)
    $js_raw .= comp_to_var($comp) . " = new " . $comp . "()\n";
    $js_raw .= "components.push(" . comp_to_var($comp) . ")\n";
}
$js_raw .= qq(:##}\n);

# run HTML diversion filter over JS code
my $js_code = diversion_filter($js_raw);

#remove_diversions
print $fh ($js_code);
close($fh);

if ($do_uglify) {
    print("Uglifying build/js/app.min.js ...\n");
    rename("build/js/app.min.js", "build/js/app.min.tmp") or die;
    (system("uglifyjs --compress --mangle -- build/js/app.min.tmp > build/js/app.min.js") == 0) or die;
    unlink("build/js/app.min.tmp") or die;
}

exit 0;

# ------------------------------------------------------

# TabLoggingComponent -> tabLoggingComponent
sub comp_to_var {
    my ($comp) = @_;

    return lc(substr($comp, 0, 1)) . substr($comp, 1);
}

sub build_html {
    my $html_contents = process_html_file("src", "main.html");

    my $js_filelist = list_js_files("src");
    my $raw_contents = concat_files($js_filelist);
    my $diversions = extract_diversions($raw_contents);

    # append HTML diversions to contents
    $html_contents .= $diversions;

    # run WML diversion filter
    my $output1 = diversion_filter($html_contents);
    my $output = htmlstrip($output1);

    print("writing build/index.html\n") if $::verbose_mode;     #  out of src/main.html
    open(my $fh, ">", "build/index.html") or die;
    print $fh $output;
#    print $fh $diversions;
    close($fh);
}

sub extract_diversions {
    my ($raw_contents) = @_;

    # extract only HTML diversions...
    my $diversions = "";
    my $div_level = 0;
    for (split(/(\n)/o, $raw_contents)) {
        if (/\{\#(.+)\#:/o) {     # opening tag {#TAG#:
            print STDERR "$div_level tag: $1\n" if $::verbose_mode;
            $div_level++;

            s/^\s*\/\/\s*//go;
        }
        elsif (/:\#\#\}/o) {      # closing tag :##}
            $div_level--;

            s/^\s*\/\/\s*//go;
            $diversions .= "$_";
            next;
        }

        ($diversions .= $_) if $div_level;
    }

    return $diversions;
}

# sub remove_diversions {
#     my ($raw_contents) = @_;
#
#     # extract only HTML diversions...
#     my $outside_diversions = "";
#     my $div_level = 0;
#     for (split(/(\n)/o, $raw_contents)) {
#         if (/\{\#.+\#:/o) {     # opening tag {#TAG#:
#             $div_level++;
#
#             s/^\s*\/\/\s*//go;
#         }
#         elsif (/:\#\#\}/o) {      # closing tag :##}
#             $div_level--;
#
#             #s/^\s*\/\/\s*//go;
#             #$outside_diversions .= "$_";
#             next;
#         }
#
#         ($outside_diversions .= $_) unless $div_level;
#     }
#
#     return $outside_diversions;
# }

sub process_html_file {
    my ($prefix, $filename) = @_;

    print STDERR "reading $prefix/$filename\n" if $::verbose_mode;

    my $result;

    open(my $fh, "<", "$prefix/$filename") or die "cannot open file $prefix/$filename for reading: $!\n";
    while (<$fh>) {
        if (/<xapp-include\s+file=\"(.+)\"\s*\/?\s*>/o) {
            # disable include, so do nothing...
        }
        elsif (/<app-include\s+file=\"(.+)\"\s*\/?\s*>/o) {
            (-f "$prefix/$1") or die "$prefix/$filename:$.: include file missing $prefix/$1\n";
            $result .= process_html_file($prefix, $1);
        }
        else {
            $result .= "$_";
        }
    }
    close($fh);

    return $result;
}

sub list_js_files {
    my ($dir) = @_;

    my $list = [];

    opendir(DIR, $dir) or die;
    my @files = readdir(DIR);
    closedir(DIR);

    for my $file (@files) {
        next if $file =~ /^\./o;
        if ($file =~ /\.js$/o) {
            push(@$list, "$dir/$file");
        }
        elsif (-d "$dir/$file") {
            push(@$list, @{list_js_files("$dir/$file")});
        }
    }

    return $list;
}

sub order_js {
    my ($js_filelist) = @_;

    my $ordered = [];

    my %dep;
    my %provides;
    for my $f (@$js_filelist) {
        #print "$f\n";
        $dep{$f} = {};

        # check for references
        print STDERR "Reading file $f\n" if $::debug_mode;
        open(IN, $f) or die "cannot open js file $f for reading: $!";
        while (<IN>) {
            chop;

            # remove comments
            # if ($::js_remove_comments) {
            s/\/\/.*$//o;
            # }

            if (/class\s+(\S+)/o) {
                $provides{$f}{$1} = 1;

                print STDERR "SCAN: $f provides $1\n" if $debug_mode;

                # HACK: make main.js dependant of all classes, so that main.js is put last
                $dep{"src/main.js"}{$1} = 1;
            }

            # class PowerButtonComponent extends WebComponent {
            if (/class\s+(\S+)\s+extends\s(\S+)/o) {
                unless ($standardClass{$2}) {
                    $dep{$f}{$2} = 1;
                    $comp = $1;
                    if ($comp =~ /Component$/o) {
                        print STDERR "COMPONENT: $comp\n" if $debug_mode;
                        push(@components, $comp);
                    }
                }
            }

            #     components.push(new PowerButtonComponent())
            if (/new\s+([A-Za-z]+)\(/o) {
                unless ($standardClass{$1}) {
                    $dep{$f}{$1} = 1;
                }
            }
        }
        close(IN);
    }

    my %classes;
    my %files;
    # loop while we have files left
    while (keys %files < keys %dep) {
        print STDERR "LOOP\n" if $debug_mode;
        my $progress = 0;

        # loop through all files
        for my $f (sort keys %dep) {
            # skip done files
            next if $files{$f};

            print STDERR "checking $f ...\n" if $debug_mode;

            # all dependencies satisfied ?
            my $satisfied = 1;
            for my $d (sort keys %{$dep{$f}}) {
                print STDERR "  checking dependency $d: " if $debug_mode;
                if (not exists $have{$d} and not $provides{$f}{$d}) {
                    print STDERR "still unresolved\n" if $debug_mode;

                    $satisfied = 0;
                }
                else {
                    print STDERR "resolved!\n" if $debug_mode;
                }
            }

            if ($satisfied) {
                print STDERR "LOAD " if $debug_mode;
                #print "$f\n";
                push(@$ordered, $f);
                $files{$f} = 1;

                for my $p (sort keys %{$provides{$f}}) {
                    #print STDERR " -> provides $p\n";
                    $have{$p} = 1;
                }

                $progress = 1;
            }

            print STDERR "\n" if $debug_mode;
        }

        unless ($progress) {
            for my $f (sort keys %dep) {
                next if $files{$f};

                for my $d (sort keys %{$dep{$f}}) {
                    if (not exists $have{$d} and not $provides{$f}{$d}) {
                        print STDERR "unresolved dependency: $f -> $d\n";
                    }
                }
            }
            die "no progress satisfying all dependencies, stopping now\n";
        }

        print STDERR "------\n\n" if $debug_mode;
    }

    return $ordered;
}

sub concat_files {
    my ($filelist) = @_;

    my $result;

    for my $file (@$filelist) {
        print STDERR "Reading file $file\n" if $::debug_mode;
        open(IN, $file) or die;
        $result .= join('', <IN>);
        # while (<IN>) {
        #     # unless ($::do_uglify) {
        #     #     # remove comments
        #     #     s/\r?\n$//o;
        #     #     s,[^:]//.*$,,o;         # HACK: don't match http:// ...
        #     #     $_ .= "\n";
        #     # }
        #
        #     $result .= $_;
        # }
        close(IN);
    }

    return $result;
}


# -------------------------------

# CS-20040921:
# diversion_filter was copied from Ralf S. Engelschall's wml_p5_divert
#
##  divert -- Diversion Filter
##  Copyright (c) 1997-2001 Ralf S. Engelschall, All Rights Reserved.
##  Copyright (c) 1999-2001 Denis Barbier, All Rights Reserved.

sub diversion_filter {
  my ($input) = @_;

##
##   Pass 1: Parse the input data into disjunct location buffers
##           Each location buffer contains plain text blocks and
##           location pointers.
##

my $location = 'main';                       # currently active location
my @LOCSTACK = ('null');                     # stack of remembered locations
my %BUFFER   = ('null' => [], 'main' => []); # the location buffers
my %OVRWRITE = ();                           # the overwrite flags
my $line = 0;
my $remain;

for $_ (split(/(\n)/o,$input)) {
    $remain = $_;
    $line++;
    while ($remain) {
        if (   $remain =~ s|^<<([a-zA-Z][a-zA-Z0-9_]*)>>||
            or $remain =~ s|^{#([a-zA-Z][a-zA-Z0-9_]*)#}||) {
            ##
            ##  Tag: dump location
            ##

            #   initialize new location buffer
            $BUFFER{$1} = [] if (not exists($BUFFER{$1}));

            #   insert location pointer into current location
            if ($BUFFER{$location} == $BUFFER{$1}) {
                warning($file, $line, "self-reference of location ``$location'' - ignoring");
            }
            else {
                push(@{$BUFFER{$location}}, $BUFFER{$1});
            }
        }
        elsif (   $remain =~ s|^\.\.(\!?[a-zA-Z][a-zA-Z0-9_]*\!?)>>||
               or $remain =~ s|^{#(\!?[a-zA-Z][a-zA-Z0-9_]*\!?)#:||) {
            ##
            ##  Tag: enter location
            ##

            #   remember old location on stack
            push(@LOCSTACK, $location);

            #   determine location and optional
            #   qualifies, then enter this location
            $location = $1;
            my $rewind_now  = 0;
            my $rewind_next = 0;
            if ($location =~ m|^\!(.*)$|) {
                #   location should be rewinded now
                $location = $1;
                $rewind_now = 1;
            }
            if ($location =~ m|^(.*)\!$|) {
                #   location should be rewinded next time
                $location = $1;
                $rewind_next = 1;
            }

            #   initialize location buffer
            $BUFFER{$location} = [] if (not exists($BUFFER{$location}));

            #   is a "rewind now" forced by a "rewind next" from last time?
            if ($OVRWRITE{$location}) {
                $rewind_now = 1;
                $OVRWRITE{$location} = 0;
            }

            #   remember a "rewind next" for next time
            $OVRWRITE{$location} = 1 if ($rewind_next);

            #   execute a "rewind now" by clearing the location buffer
            if ($rewind_now == 1) {
                while ($#{$BUFFER{$location}} > -1) {
                    shift(@{$BUFFER{$location}});
                }
            }
        }
        elsif (   $remain =~ s|^<<([a-zA-Z][a-zA-Z0-9_]*)?\.\.||
               or $remain =~ s|^:#([a-zA-Z][a-zA-Z0-9_]*)?#}||) {
            ##
            ##  Tag: leave location
            ##

            if ($#LOCSTACK == -1) {
                warning($file, $line, "already in ``null'' location -- ignoring leave");
            }
            else {
                my $loc = $1;
                if ($loc eq 'null') {
                    warning($file, $line, "cannot leave ``null'' location -- ignoring named leave");
                }
                elsif ($loc ne '' and $loc ne $location) {
                    #   leave the named location and all locations
                    #   on the stack above it.
                    my $n = -1;
                    for (my $i = $#LOCSTACK; $i >= 0; $i--) {
                        if ($LOCSTACK[$i] eq $loc) {
                            $n = $i;
                            last;
                        }
                    }
                    if ($n == -1) {
                        warning($file, $line, "no such currently entered location ``$loc'' -- ignoring named leave");
                    }
                    else {
                        splice(@LOCSTACK, $n);
                        $location = pop(@LOCSTACK);
                    }
                }
                else {
                    #   leave just the current location
                    $location = pop(@LOCSTACK);
                }
            }
        }
        else {
            ##
            ##  Plain text
            ##

            #   calculate the minimum amount of plain characters we can skip
            my $l = length($remain);
            my $i1 = index($remain, '<<');  $i1 = $l if $i1 == -1;
            #   Skip ../ which is often used in URLs
            my $i2 = -1;
            do {
                $i2 = index($remain, '..', $i2+1);
            } while ($i2 > -1 and $i2+2 < $l and substr($remain, $i2+2, 1) eq '/');
            $i2 = $l if $i2 == -1;

            my $i3 = index($remain, '{#');  $i3 = $l if $i3 == -1; #}
            my $i4 = index($remain, ':#');  $i4 = $l if $i4 == -1;

            my $i = $i1;
            $i = $i2 if $i > $i2;
            $i = $i3 if $i > $i3;
            $i = $i4 if $i > $i4;

            #   skip at least 2 characters if we are sitting
            #   on just a "<<", "..", "{#" or ":#"
            $i = 1 if ($i == 0);

            #   append plain text to remembered data and adjust $remain
            #   variable
            if ($i == $l) {
                push(@{$BUFFER{$location}}, $remain);
                $remain = '';
            } else {
                #   substr with 4 arguments was introduced in perl 5.005
                push(@{$BUFFER{$location}}, substr($remain, 0, $i));
                substr($remain, 0, $i) = '';
            }
        }
    }
}


##
##   Pass 2: Recursively expand the location structure
##           by starting from the main location buffer
##

@LOCSTACK = ();

sub ExpandDiversion {
    my ($loc) = @_;
    my ($data, $locseen, $name, $n, $el);

    #   check for recursion by making sure
    #   the current location has not already been seen.
    foreach $locseen (@LOCSTACK) {
        if ($locseen == $loc) {
            #   find name of location via location pointer
            #   for human readable warning message
            $name = 'unknown';
            foreach $n (keys(%BUFFER)) {
                if ($BUFFER{$n} == $loc) {
                    $name = $n;
                    last;
                }
            }
            warning($file, $line, "recursion through location ``$name'' - break");
            return '';
        }
    }

    #   ok, location still not seen,
    #   but remember it for recursive calls.
    push(@LOCSTACK, $loc);

    #   recursively expand the location
    #   by stepping through its list elements
    $data = '';
    foreach $el (@{$loc}) {
        if (ref($el)) {
            #   element is a location pointer, so
            #   recurse into the expansion of it
            $data .= ExpandDiversion($el);
        }
        else {
            #   element is just a plain text block
            $data .= $el;
        }
    }

    #   we can remove the location from
    #   the stack because we are back from recursive calls.
    pop(@LOCSTACK);

    #   return expanded buffer
    return $data;
}

return ExpandDiversion($BUFFER{'main'});

}

# -------------------------------

# CS-20040921:
# html_strip was copied from Ralf S. Engelschall's wml_p8_htmlstrip
#
##  htmlstrip -- Strip HTML markup code
##  Copyright (c) 1997-2000 Ralf S. Engelschall, All Rights Reserved.
##  Copyright (c) 2000 Denis Barbier

sub htmlstrip {
  my ($INPUT) = @_;

  $opt_v = 0;
  $opt_o = '-';
  $opt_O = 2;
  $opt_b = 16384;

#
#   global initial stripping
#

#&verbose("Strip sharp-like comments");
#   strip sharp-like comments
#$INPUT =~ s|^\s*#.*$||mg;
1 while ($INPUT =~ s/^([ \t]*)#[^\n]*\n//s); # special  case: at begin
$INPUT =~ s/\n[ \t]*#[^\n]*(?=\n)//sg;       # standard case: in the middle
$INPUT =~ s/\n[ \t]*#[^\n]*\n?$/\n/s;        # special  case: at end
$INPUT =~ s/^([ \t]*)\\(#)/$1$2/mg;          # remove escaping backslash

#
#   stripping functions for particular areas
#

#   Strip Plain Text, i.e. outside of any
#   preformatted area and outside any HTML tag.
sub StripPlainText {
    my ($buf) = @_;

    #   Level 0
    #if ($opt_O >= 0) {
    #}
    #   Level 1
    if ($opt_O >= 1) {
        #   strip empty lines
        $buf =~ s|\n\s*\n|\n|sg;
    }
    #   Level 2
    if ($opt_O >= 2) {
        #   strip multiple whitespaces to single one
        $buf =~ s|(\S+)[ \t]{2,}|$1 |sg;
        #   strip trailing whitespaces
        $buf =~ s|\s+\n|\n|sg;
    }
    #   Level 3
    if ($opt_O >= 3) {
        #   strip leading whitespaces
        $buf =~ s|^\s+||mg;
    }
    #   Level 4
    if ($opt_O >= 4) {
        #   strip empty lines again
        $buf =~ s|^\s*$||mg;
        $buf =~ s|\n\n|\n|sg;
    }
    #   Level 5
    if ($opt_O >= 5) {
        #   concatenate all lines
        $buf =~ s|\n| |sg;
        #
        $from = $buf;
        $line = '';
        $buf = '';
        sub nexttoken {
            my ($buf) = @_;
            my ($token, $bufN);

            if ($buf =~ m|^([^<]+?)(<.+)$|s) {
                $token = $1;
                $bufN  = $2;
            }
            elsif ($buf =~ m|^(<[^>]+>)(.*)$|s) {
                $token = $1;
                $bufN  = $2;
            }
            else {
                $token = $buf;
                $bufN  = '';
            }

            if (length($token) > 80) {
                $x = substr($token, 0, 80);
                $i = rindex($x, ' ');
                $bufN = substr($token, $i) . $bufN;
                $token = substr($token, 0, $i);
            }
            return ($token, $bufN);
        }
        while (length($from) > 0) {
            ($token, $from) = &nexttoken($from);
            if ((length($line) + length($token)) < 80)  {
                $line .= $token;
            }
            else {
                $buf .= $line . "\n";
                $line = $token;
            }
        }
        $buf =~ s|^\s+||mg;
        $buf =~ s|\s+$||mg;
    }

    return $buf;
}

#   Strip HTML Tag, i.e. outside of any
#   preformatted area but inside a HTML tag.
sub StripHTMLTag {
    my ($buf) = @_;

    #   Level 0
    #if ($opt_O >= 0) {
    #}
    #   Level 1
    #if ($opt_O >= 1) {
    #}
    #   Level 2
    if ($opt_O >= 2) {
        #   strip multiple whitespaces to single one
        $buf =~ s|(\S+)[ \t]{2,}|$1 |mg;
        #   strip trailing whitespaces at end of line
        $buf =~ s|\s+\n|\n|sg;
        #   strip whitespaces between attribute name and value
        $buf =~ s|([ \t]+[a-zA-Z][a-zA-Z0-9_]*)\s*=\s*|$1=|sg;
        #   strip whitespaces before tag end
        $buf =~ s|[ \t]+>$|>|sg;
    }
    #   Level 3
    #if ($opt_O >= 3) {
    #}
    #   Level 4
    if ($opt_O >= 4) {
        #   strip HTML comments
        $buf =~ s|<!--.+?-->||sg;
        #   strip newlines before tag end
        $buf =~ s|\n>$|>|sg;
    }
    #   Level 5
    #if ($opt_O >= 5) {
    #}

    return $buf;
}

#   Strip Preformatted Areas, i.e.  inside
#   <pre>, <xmp> and <nostrip> container tags.
sub StripPreformatted {
    my ($buf) = @_;

    #   Level 0
    #if ($opt_O >= 0) {
    #}
    #   Level 1
    #if ($opt_O >= 1) {
    #}
    #   Level 2
    if ($opt_O >= 2) {
        #   strip trailing whitespaces on non-empty lines
        $buf =~ s|([^\s]+)[ \t]+\n|$1\n|sg;
    }
    #   Level 3
    #if ($opt_O >= 3) {
    #}
    #   Level 4
    #if ($opt_O >= 4) {
    #}
    #   Level 5
    #if ($opt_O >= 5) {
    #}

    return $buf;
}

#
#   Processing Loop
#
%TAGS = (
  "nostrip" => 1,
  "pre"     => 0,
  "xmp"     => 0,
);

$OUTPUT = '';

sub StripNonPreformatted {
    my ($I) = @_;
    my ($O);

    $O = '';
    while ($I =~ s|^(.*?)(<.+?>)||s) {
        $O .= &StripPlainText($1);
        $O .= &StripHTMLTag($2);
    }
    $O .= &StripPlainText($I);
    return $O;
}

#   On large files, benchmarking show that most of the time is spent
#   here because of the complicated regexps.  To minimize memory usage
#   and CPU time, input is splitted into small chunks whose size may
#   be changed by the -b flag.

#&verbose("Main processing");
$chunksize = $opt_b;
$loc = 0;
do {
    $NEXT = '';
    if ($chunksize > 0 && $chunksize < 32767 && length($INPUT) > $chunksize) {
        ($INPUT, $NEXT) = ($INPUT =~ m|^(.{$chunksize})(.*)$|s);
    }
    while (1) {
        #   look for a begin tag
        $len = length($INPUT);
        $pos = $len;
        foreach $tag (keys(%TAGS)) {
            if ($INPUT =~ m|^(.*?)(<$tag(?:\s+[^>]*)?>)(.*)$|is) {
                $n = length($1);
                if ($n < $pos) {
                    $pos = $n;
                    $prolog = $1;
                    $curtag = $2;
                    $epilog = $3;
                    $tagname = $tag;
                }
            }
        }
        if ($pos < $len) {
            $str = sprintf "found $curtag at position %d", $loc+$pos;
            #&verbose($str);
            $o = &StripNonPreformatted($prolog);
            $o =~ s|^\n||s if $OUTPUT =~ m|\n$|s;
            $OUTPUT .= $o;

            #   if end tag not found, extend string
            if ($epilog =~ s|^(.*?)(</$tagname>)||is) {
                $body   = $1;
                $endtag = $2;
            }
            else {
                $INPUT = $curtag . $epilog . $NEXT;
                $chunksize += $opt_b;
                last;
            }

            $str = sprintf "found $endtag at position %d",
                $loc+$pos+length($body);
            #&verbose($str);
            $OUTPUT .= $curtag if (not $TAGS{$tagname});
            $OUTPUT .= &StripPreformatted($body);
            $OUTPUT .= $endtag if (not $TAGS{$tagname});
            $loc  += $pos + length($body) + length($curtag);
            $INPUT = $epilog;
            next;
        }
        else {
            if ($INPUT =~ m|^(.+)(<.*)$|s) {
                $loc += length($1);
                $INPUT = $2;
                $o = &StripNonPreformatted($1);
                $o =~ s|^\n||s if $OUTPUT =~ m|\n$|s;
                $OUTPUT .= $o;
            }
            if ($NEXT) {
                if (length($INPUT) < $chunksize) {
                    $chunksize = $opt_b;
                }
                else {
                    $chunksize += $opt_b;
                }
                $INPUT .= $NEXT;
            }
            else {
                $o = &StripNonPreformatted($INPUT);
                $o =~ s|^\n||s if $OUTPUT =~ m|\n$|s;
                $OUTPUT .= $o;
                $INPUT = '';
            }
            last;
        }
    }
    if ($NEXT eq '') {
        $OUTPUT .= $INPUT;
        $INPUT = '';
    }
} while ($INPUT);

#
#   global final stripping
#
#&verbose("Fix <suck> special command");
$OUTPUT =~ s|\s*<suck(\s*/)?>\s*||isg;
$OUTPUT =~ s|^\n||s;

#CS-20240704: remove trailing spaces in every line
if ($::html_remove_leading_spaces) {
    $OUTPUT =~ s|^\s+||gm;
}

return $OUTPUT;
}

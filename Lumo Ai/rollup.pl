#! perl

%standardClass = qw(
Array 1
Date 1
FormData 1
XMLHttpRequest 1
Dygraph 1
);

$debug_mode = 0;
$do_uglify = 0;

# ---end-of-configuration-part---

system("mkdir -p build/js");
system("cp -a assets/* build");

print("Generating build/index.html out of src/index.html ...\n");
open(my $fh, ">", "build/index.html") or die;
process_html_file($fh, "src", "index.html");
close($fh);

print("Analysing js files ...\n");
my $js_filelist = list_js_files("src/js");
my $js_filelist_ordered = order_js($js_filelist);
print("Generating build/js/main.bundle.min.js out of src/js/main.js ...\n");
open(my $fh, ">", "build/js/main.bundle.min.js") or die;
concat_files($fh, $js_filelist_ordered);
close($fh);

if ($do_uglify) {
    print("Uglifying build/js/main.bundle.min.js ...\n");
    rename("build/js/main.bundle.min.js", "build/js/main.bundle.min.tmp") or die;
    (system("uglifyjs --compress --mangle -- build/js/main.bundle.min.tmp > build/js/main.bundle.min.js") == 0) or die;
    unlink("build/js/main.bundle.min.tmp") or die;
}

exit 0;

# ------------------------------------------------------

sub process_html_file {
    my ($fho, $prefix, $filename) = @_;

    print STDERR "Reading file $prefix/$filename\n" if $::debug_mode;

    open(my $fh, "<", "$prefix/$filename") or die "cannot open file $prefix/$filename for reading: $!\n";
    while (<$fh>) {
        if (/<xapp-include\s+file=\"(.+)\"\s*\/?\s*>/o) {
            # disable include, so do nothing...
        }
        elsif (/<app-include\s+file=\"(.+)\"\s*\/?\s*>/o) {
            process_html_file($fho, $prefix, $1);
        }
        else {
            print $fho "$_";
        }
    }
    close($fh);
}

sub list_js_files {
    my $list = [];

    for my $dir (@_) {
        opendir(DIR, $dir) or die;
        for my $file (readdir(DIR)) {
            next if $file =~ /^\./o;
            if ($file =~ /\.js$/o) {
                push(@$list, "$dir/$file");
            }
        }
        closedir(DIR);
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

            if (/class\s+(\S+)/o) {
                $provides{$f}{$1} = 1;

                print STDERR "SCAN: $f provides $1\n" if $debug_mode;
            }

            # class PowerButtonComponent extends WebComponent {
            if (/class\s+(\S+)\s+extends\s(\S+)/o) {
                unless ($standardClass{$2}) {
                    $dep{$f}{$2} = 1;
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
    my ($fho, $filelist) = @_;

    for my $file (@$filelist) {
        print STDERR "Reading file $file\n" if $::debug_mode;
        open(IN, $file) or die;
        while (<IN>) {
            unless ($::do_uglify) {
                # remove comments
                s/\r?\n$//o;
                s,[^:]//.*$,,o;         # HACK: don't match http:// ...
                $_ .= "\n";
            }

            print $fho "$_";
        }
        close(IN);
    }
}

// App and mascot name – change here, everything else follows.
export const brand = {
  appName: 'English Fox GT',
  shortName: 'English Fox',
  tagline: 'Grammar Trainer',
  foxName: 'Rufus',
}

// German genitive: "Rufus' Tipp", "Zips Tipp"
export const foxGenitive = brand.foxName.endsWith('s') ? `${brand.foxName}'` : `${brand.foxName}s`

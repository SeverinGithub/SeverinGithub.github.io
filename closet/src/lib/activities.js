import { getItemTagKeys } from './tags.js'

const WORK_AVOID = [
  'style:sport',
  'style:street',
  'style:vintage',
  'fit:baggy',
  'fit:oversized',
  'type:hoodie',
  'type:shorts',
  'type:sneaker',
  'color:yellow',
  'color:orange',
  'color:pink',
  'color:purple',
  'color:red',
]

/** Alle Aktivitäten (OOTD + Fits) */
export const ACTIVITIES = [
  {
    id: 'school',
    label: 'Schule',
    prefer: ['style:casual', 'style:minimal', 'type:chino', 'type:jeans', 'type:tshirt', 'type:sneaker', 'fit:regular'],
    avoid: [...WORK_AVOID, 'style:formal', 'type:shorts'],
  },
  {
    id: 'work',
    label: 'Arbeit',
    prefer: [
      'dir:business',
      'style:formal',
      'vibe:professional',
      'vibe:office',
      'vibe:smart-casual',
      'type:shirt',
      'type:chino',
      'fit:slim',
      'color:black',
      'color:navy',
    ],
    avoid: [...WORK_AVOID, 'type:jeans'],
  },
  {
    id: 'sport',
    label: 'Sport',
    prefer: ['dir:sport', 'style:sport', 'vibe:athletic', 'vibe:gym', 'type:sneaker', 'type:shorts', 'vibe:performance'],
    avoid: ['style:formal', 'type:coat'],
  },
  {
    id: 'city',
    label: 'Stadt / Ausgehen',
    prefer: ['style:street', 'style:casual', 'type:jeans', 'type:sneaker', 'type:jacket', 'fit:regular'],
    avoid: ['style:formal', 'type:shorts', 'semantic:outdoor'],
  },
  {
    id: 'casual',
    label: 'Casual',
    prefer: ['dir:casual', 'style:casual', 'vibe:relaxed', 'vibe:everyday', 'type:jeans', 'type:tshirt', 'type:sneaker'],
    avoid: ['style:formal'],
  },
  {
    id: 'date',
    label: 'Date',
    prefer: [
      'style:minimal',
      'style:casual',
      'fit:slim',
      'fit:regular',
      'color:black',
      'color:white',
      'color:beige',
      'color:navy',
      'type:shirt',
      'type:polo',
      'material:leather',
    ],
    avoid: ['style:sport', 'fit:baggy', 'fit:oversized', 'type:hoodie', 'type:shorts', 'color:yellow', 'color:orange'],
  },
  {
    id: 'fashion',
    label: 'Modisch',
    prefer: [
      'dir:fashion',
      'vibe:fashion-forward',
      'vibe:stylish',
      'vibe:modern',
      'vibe:trendy',
      'style:street',
      'fit:oversized',
      'type:jeans',
      'type:sneaker',
    ],
    avoid: ['style:formal', 'style:sport'],
  },
  {
    id: 'university',
    label: 'Uni',
    prefer: ['style:casual', 'style:minimal', 'type:hoodie', 'type:jeans', 'type:sneaker', 'fit:regular'],
    avoid: ['style:formal', 'type:shorts', 'type:shirt'],
  },
  {
    id: 'interview',
    label: 'Bewerbung',
    prefer: ['style:formal', 'style:minimal', 'type:shirt', 'type:chino', 'fit:slim', 'color:black', 'color:navy', 'color:white'],
    avoid: [...WORK_AVOID, 'type:jeans', 'type:hoodie'],
  },
  {
    id: 'meeting',
    label: 'Meeting',
    prefer: ['style:formal', 'style:minimal', 'type:shirt', 'type:polo', 'type:chino', 'color:navy', 'color:black'],
    avoid: [...WORK_AVOID],
  },
  {
    id: 'party',
    label: 'Party',
    prefer: ['style:street', 'style:casual', 'fit:slim', 'color:black', 'material:leather', 'type:jeans'],
    avoid: ['style:sport', 'semantic:outdoor', 'type:shorts'],
  },
  {
    id: 'club',
    label: 'Club / Nacht',
    prefer: ['style:street', 'style:minimal', 'fit:slim', 'color:black', 'type:jeans', 'material:leather'],
    avoid: ['style:sport', 'semantic:outdoor', 'type:shorts', 'type:hoodie'],
  },
  {
    id: 'concert',
    label: 'Konzert',
    prefer: ['style:street', 'style:casual', 'type:jeans', 'type:hoodie', 'type:sneaker', 'type:boots'],
    avoid: ['style:formal'],
  },
  {
    id: 'museum',
    label: 'Museum / Kultur',
    prefer: ['style:minimal', 'style:casual', 'type:chino', 'type:shirt', 'fit:regular', 'color:beige', 'color:black'],
    avoid: ['style:sport', 'type:shorts', 'type:hoodie', 'semantic:neon'],
  },
  {
    id: 'brunch',
    label: 'Brunch',
    prefer: ['style:casual', 'style:minimal', 'type:shirt', 'type:polo', 'color:beige', 'color:white', 'fit:regular'],
    avoid: ['style:sport', 'type:shorts', 'semantic:outdoor'],
  },
  {
    id: 'coffee',
    label: 'Café',
    prefer: ['style:casual', 'style:minimal', 'type:jeans', 'type:tshirt', 'fit:regular', 'color:beige'],
    avoid: ['style:formal', 'style:sport', 'type:shorts'],
  },
  {
    id: 'shopping',
    label: 'Einkaufen',
    prefer: ['style:casual', 'type:jeans', 'type:sneaker', 'type:tshirt', 'fit:regular'],
    avoid: ['style:formal'],
  },
  {
    id: 'travel',
    label: 'Reise',
    prefer: ['style:casual', 'fit:regular', 'type:jeans', 'type:sneaker', 'material:cotton', 'color:gray', 'color:navy'],
    avoid: ['style:formal', 'semantic:party'],
  },
  {
    id: 'airport',
    label: 'Flughafen',
    prefer: ['style:casual', 'style:minimal', 'fit:regular', 'type:hoodie', 'type:jeans', 'type:sneaker', 'color:gray'],
    avoid: ['style:formal', 'type:shorts'],
  },
  {
    id: 'gym',
    label: 'Fitnessstudio',
    prefer: ['style:sport', 'type:shorts', 'type:hoodie', 'type:sneaker', 'material:cotton'],
    avoid: ['style:formal', 'type:shirt', 'type:boots', 'material:leather'],
  },
  {
    id: 'hiking',
    label: 'Wandern',
    prefer: ['style:sport', 'semantic:outdoor', 'type:shorts', 'type:boots', 'material:cotton', 'color:green', 'color:gray'],
    avoid: ['style:formal', 'type:shirt', 'type:polo', 'material:leather'],
  },
  {
    id: 'rain',
    label: 'Regentag',
    prefer: ['semantic:outdoor', 'type:coat', 'type:boots', 'color:navy', 'color:black', 'material:wool'],
    avoid: ['type:shorts', 'type:sneaker', 'color:white'],
  },
  {
    id: 'cold',
    label: 'Kalt draußen',
    prefer: ['type:coat', 'material:wool', 'type:boots', 'material:knit', 'color:black', 'color:navy'],
    avoid: ['type:shorts', 'type:tshirt'],
  },
  {
    id: 'hot',
    label: 'Heiß draußen',
    prefer: ['type:shorts', 'type:tshirt', 'type:polo', 'material:linen', 'material:cotton', 'color:white', 'color:beige'],
    avoid: ['type:coat', 'material:wool', 'type:boots'],
  },
  {
    id: 'beach',
    label: 'Strand',
    prefer: ['type:shorts', 'type:tshirt', 'color:white', 'color:beige', 'material:linen', 'style:casual'],
    avoid: ['style:formal', 'type:coat', 'type:boots', 'material:wool'],
  },
  {
    id: 'home',
    label: 'Zuhause',
    prefer: ['style:casual', 'type:hoodie', 'type:tshirt', 'fit:oversized', 'fit:baggy', 'material:cotton'],
    avoid: ['style:formal'],
  },
  {
    id: 'wedding',
    label: 'Hochzeit',
    prefer: ['style:formal', 'style:minimal', 'type:shirt', 'fit:slim', 'color:black', 'color:navy', 'color:white', 'material:leather'],
    avoid: ['style:sport', 'type:shorts', 'type:hoodie', 'type:sneaker', 'semantic:neon'],
  },
  {
    id: 'bike',
    label: 'Fahrrad',
    prefer: ['style:sport', 'style:casual', 'type:shorts', 'type:sneaker', 'material:cotton'],
    avoid: ['style:formal', 'type:coat', 'type:boots'],
  },
  {
    id: 'walk',
    label: 'Spaziergang',
    prefer: ['style:casual', 'type:jeans', 'type:sneaker', 'type:jacket', 'fit:regular'],
    avoid: ['style:formal', 'semantic:party'],
  },
  {
    id: 'photoshoot',
    label: 'Fotoshooting',
    prefer: ['style:street', 'style:minimal', 'fit:slim', 'color:black', 'color:white'],
    avoid: ['style:sport', 'semantic:outdoor'],
  },
  {
    id: 'office',
    label: 'Büro',
    prefer: ['style:formal', 'style:minimal', 'type:shirt', 'type:polo', 'type:chino', 'color:navy', 'color:black', 'color:gray'],
    avoid: ['style:sport', 'type:shorts', 'type:hoodie', 'semantic:party'],
  },
  {
    id: 'running',
    label: 'Laufen',
    prefer: ['style:sport', 'type:shorts', 'type:sneaker', 'material:cotton'],
    avoid: ['style:formal', 'type:coat', 'type:boots', 'material:leather'],
  },
  {
    id: 'restaurant',
    label: 'Restaurant',
    prefer: ['style:minimal', 'style:casual', 'type:shirt', 'type:polo', 'fit:slim', 'color:black', 'color:navy', 'material:leather'],
    avoid: ['style:sport', 'type:hoodie', 'type:shorts', 'semantic:outdoor'],
  },
  {
    id: 'vacation',
    label: 'Urlaub',
    prefer: ['style:casual', 'type:jeans', 'type:tshirt', 'type:sneaker', 'material:linen', 'color:beige', 'color:white'],
    avoid: ['style:formal', 'semantic:party'],
  },
  {
    id: 'outdoor',
    label: 'Outdoor',
    prefer: ['style:sport', 'semantic:outdoor', 'type:shorts', 'type:boots', 'material:cotton', 'color:green', 'color:gray'],
    avoid: ['style:formal', 'type:polo', 'semantic:party'],
  },
  {
    id: 'festival',
    label: 'Festival',
    prefer: ['style:street', 'style:casual', 'type:jeans', 'type:hoodie', 'type:sneaker', 'type:boots'],
    avoid: ['style:formal'],
  },
  {
    id: 'family',
    label: 'Familienfeier',
    prefer: ['style:casual', 'style:minimal', 'type:chino', 'type:shirt', 'type:polo', 'fit:regular', 'color:beige'],
    avoid: ['style:sport', 'type:shorts', 'semantic:neon'],
  },
  {
    id: 'dinner',
    label: 'Abendessen',
    prefer: ['style:minimal', 'style:casual', 'fit:slim', 'type:shirt', 'color:black', 'color:navy', 'color:white', 'material:leather'],
    avoid: ['style:sport', 'type:hoodie', 'type:shorts'],
  },
  {
    id: 'gaming',
    label: 'Gaming',
    prefer: ['style:casual', 'type:hoodie', 'type:tshirt', 'fit:oversized', 'material:cotton'],
    avoid: ['style:formal'],
  },
  {
    id: 'chill',
    label: 'Chillen',
    prefer: ['style:casual', 'type:hoodie', 'type:tshirt', 'fit:oversized', 'fit:baggy', 'material:cotton'],
    avoid: ['style:formal'],
  },
]

export function getActivity(id) {
  return ACTIVITIES.find((a) => a.id === id) ?? ACTIVITIES.find((a) => a.id === 'casual')
}

export function activityLabel(id) {
  return getActivity(id)?.label ?? id
}

export function activityLabels(ids) {
  if (!Array.isArray(ids) || !ids.length) return ''
  return ids.map((id) => activityLabel(id)).join(', ')
}

/** Score boost/penalty from activity vs item tag keys */
export function scoreActivityMatch(parts, activityId) {
  const activity = getActivity(activityId)
  let score = 0
  let preferHits = 0
  let avoidHits = 0

  for (const part of parts) {
    const keys = getItemTagKeys(part)
    for (const key of keys) {
      if (activity.prefer.includes(key)) {
        score += 16
        preferHits += 1
      }
      if (activity.avoid.includes(key)) {
        score -= 20
        avoidHits += 1
      }
    }
  }

  if (preferHits >= 2) score += 12
  if (avoidHits >= 2) score -= 15

  return score
}

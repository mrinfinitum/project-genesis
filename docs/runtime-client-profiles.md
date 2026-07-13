# Runtime Client Profiles

Project Genesis Studio owns engine-agnostic presentation intent for exported runtime data. Game clients own component layout, spacing, animation, and rendering.

## Era Navigation

The canonical runtime export includes:

```json
{
  "clientProfiles": {
    "default": {
      "eraNavigation": {
        "dashboardMode": "current_journey",
        "visibleEraCount": 3,
        "fullTimelineEnabled": true,
        "allowPrimaryHorizontalScroll": false,
        "boundaryBehavior": {
          "firstEraMode": "current_and_next",
          "middleEraMode": "previous_current_next",
          "lastEraMode": "previous_and_current"
        }
      }
    }
  }
}
```

`dashboardMode: "current_journey"` means dashboards should focus on the player's current era and nearby eras instead of showing all nine canonical eras at once. In Studio this is rendered as the compact cinematic `CivilizationEraCarousel`: a lightweight hero-bottom HUD with one emphasized current-era hex, smaller adjacent context nodes, and a compact nine-step journey track.

`visibleEraCount` is a presentation preference, not a gameplay rule. Clients should derive visible records from canonical era order plus the player's current `currentEraId`.

`fullTimelineEnabled` confirms that clients should offer a separate full Civilization Timeline view with all canonical eras, completion, mastery, research, buildings, unlocks, art readiness, and production status.

`allowPrimaryHorizontalScroll: false` means the primary dashboard should not rely on a long horizontally scrolling nine-era rail.

Preview navigation in the dashboard carousel must not change player progression. Clients should keep `player.currentEraId` separate from any temporary preview index.

Boundary behavior communicates intent only:

- first era: current and next
- middle eras: previous, current, and next
- last era: previous and current

Do not create fake previous or next eras. Always derive from canonical era IDs.

## Engine Overrides

`clientProfiles.roblox`, `clientProfiles.web`, `clientProfiles.unity`, `clientProfiles.unreal`, and `clientProfiles.godot` may override individual presentation hints while inheriting unspecified values from `clientProfiles.default`.

Do not store pixel dimensions, component geometry, or engine-specific layout rules in canonical runtime data.

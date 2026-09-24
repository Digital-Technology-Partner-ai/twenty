# Duplicate overflow tooltip fix

This patch was deployed to https://crm.digitaltechnologypartner.ai on
24 September 2026. Production runs on Omar from `/opt/dtp/twenty-crm`.

Safari/WebKit automatically displays the full text of an element truncated with
`text-overflow: ellipsis`. Twenty also displays its own app tooltip, which caused
the delayed grey duplicate. The shared component now uses single-line clamping
with `text-overflow: clip`. The visible ellipsis and Twenty tooltip remain, while
WebKit's native tooltip condition is absent.

The deployed v2.39.5 frontend differs from this branch, so production uses
`overflow-tooltip.css` as a narrow compatibility patch for its compiled shared
component. Remove or revalidate the hashed selector when upgrading Twenty.

## Production deployment

The original server image was
`sha256:10a45e64d24efec803992d776c1897b7eb15ce20bf8ca9fd0ecb47766008865d`.
The active image is `dtp-twenty-tooltip:20260924`, image ID
`sha256:db6e106694e70c52ae37b608b28e95394293a501a1680a4848e8f849686dc537`.
The server Compose file selects the patched image, so the change survives
container recreation.

The build is reproducible on Omar while the original image is retained locally:

```sh
docker tag \
  sha256:10a45e64d24efec803992d776c1897b7eb15ce20bf8ca9fd0ecb47766008865d \
  dtp-twenty-tooltip-base:20260924
docker build \
  --build-arg BASE_IMAGE=dtp-twenty-tooltip-base:20260924 \
  -t dtp-twenty-tooltip:20260924 \
  packages/twenty-docker/dtp-tooltip-fix
```

No database or backend changes are involved. The public HTML and stylesheet were
verified byte for byte after deployment, and the public health endpoint returned
`status: ok`. WebKit and Chromium checks covered overflowing and short text,
links, unbroken strings, multiline text, and the retained app tooltip.

## Rollback

Omar retains the pre-change Compose file and frontend index under
`/opt/dtp/twenty-crm/tooltip-fix-20260924`. Restore the original index to the
running server and change the server image in Compose back to
`dtp-twenty-planned-day:20260914`. Compare the saved Compose file with the current
one first so later operational changes are preserved. A database restore is not
needed.

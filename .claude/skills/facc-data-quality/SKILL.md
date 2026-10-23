---
name: facc-data-quality
description: Safely model, import, deduplicate, refresh and publish licensed local event data in FACC with source provenance, occurrence lifecycle and human moderation. Use for catalog, ingestion, source integrations or correctness issues.
---

Read `docs/DOMAIN_MODEL.md` and source sections 11, 13 and 14 when implementing data workflows.

- Rights first: no import or reuse of content/images without a documented approved legal basis and allowed scope. "Public webpage" does not imply "usable". Never scrape social/other sites indiscriminately.
- Preserve `Source`, license/rights, attribution, source URL, approved fields/media, validity, original identifiers, last verification and audit. Reject/hold records without permission or mandatory fields.
- Split `Event` from `Occurrence`. Keep IANA timezone, UTC timestamps, individual cancellation/expiry/reconfirmation. Test late-night and DST cases.
- Ingest into **staging/preview**, validate schema and links, check dedup candidates, then human approve before publishing. A re-import should be idempotent.
- Organizer-verified human changes outrank stale feed values; preserve revision history and flag conflicts for review rather than silent overwrite.
- Track field-level uncertainty. Unknown price is not free; missing accessibility is not accessible; one event with several dates is not several unique events.
- For geosearch use PostGIS with indexes and rate-limited provider-compliant geocoding; measure proximity in meters.
- Measure acceptance/rejection counts, accuracy, duplicate rate, human minutes per accepted event and licensed coverage. Never optimize for maximum scraped row count.
- If a source changes or withdraws rights, have an auditable correction/takedown workflow.

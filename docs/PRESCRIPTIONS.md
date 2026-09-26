# Prescription management

Available through **More → My Prescriptions**, or the central **Add** menu.

- Browse current, draft, confirmed and archived prescriptions, with pagination.
- Create manual drafts with 1–20 medicine lines, optional prescription/validity dates,
  catalog lookup or a medicine name as written. Blank fields remain unknown.
- Attach JPEG/PNG images to saved drafts, one consecutive page at a time (20 max).
  Images are limited to 5 MiB / 20 million pixels. Attachment upload itself does not run extraction.
- Open private document links issued by the API, valid for at most 60 seconds.
- Edit each line and explicitly review all fourteen values, including unknowns.
  Editing clears that field's review selection. Save each line before finalization.
- Confirm the saved review only when the supported daily regimen is complete:
  catalog link, dose/unit, daily times and start/end dates, with consistent optional
  daily frequency/duration. Confirmation uses every current retained field ID.
- Reject a medicine line or archive the prescription after explicit confirmation.
  Those actions preserve history; restoring rejected lines/archives is unavailable.

Confirmation is the patient's review of entered information, not professional
verification. It does not create or activate treatment schedules. Unknown values
are never guessed, and no stock or dose record is changed by this workflow.

## Conflicts and connectivity

Stale reviews require reloading the latest field revisions. Unsaved edits block
final confirmation. After an ambiguous draft creation, check the list before
creating another draft. After any upload failure, reload and reconcile the page
list before selecting a file again. Domain writes are not automatically retried;
only an authentication rejection can refresh the session and retry once.

## Server requirements

The existing API must have prescription migrations and grants applied. Attachments
require its private S3-compatible document storage settings. Database/Redis health
checks alone do not verify document storage. The signed storage endpoint must be
reachable from phones/browsers. API configuration remains server environment
variables; client apps do not receive storage credentials. Original image bytes
may retain embedded metadata; the selection UI explains this.

## Verification

Validation tests cover unknowns, dates, positive decimals, explicit times, field
review IDs, complete confirmation snapshots, duplicate medicines and attachment
bounds. Browser tests use synthetic data and exercise create/upload/review/confirm/
archive, stale reviews and recovery from a lost upload response at desktop and
phone widths. No real patient records are created by these tests.

## Mobile build

The image-library picker is a new native dependency. Rebuild/install the development
app with `pnpm android:install` (Node 24.21.0); a Metro refresh alone is insufficient.
For an existing custom native project, apply Expo config-plugin changes with
`pnpm exec expo prebuild --platform android --no-install` before rebuilding.

## Privacy-first prescription scan

The New prescription screen offers camera capture or a local image. A suggested
central selection opens in an on-device crop editor. Patients drag its corners or
adjust each edge to keep medicine lines only. The suggestion does not detect
personal information; names, addresses, IDs, barcodes and patient/doctor headers
must be excluded manually. If identifying text overlaps medicines, use manual entry.

A cropped preview appears before any image upload. Sending requires two separate,
initially unchecked confirmations:

1. The patient checked that the crop contains only medicine information and no
   patient details.
2. The patient agrees to send that crop to the Saydaliyati server and OpenAI for
   processing.

Changing the image or crop resets both confirmations. Only the newly cropped file
is uploaded with a generic filename. The API strips embedded metadata before
contacting OpenAI. Visible personal text cannot be removed or guaranteed absent by
metadata stripping. The scan endpoint stores neither the original nor the crop.
OpenAI receives `store: false`; provider account retention policies still apply.

Configure `OPENAI_API_KEY` and `PRESCRIPTION_SCAN_MODEL` on the API server. The model
must support image input and structured outputs. No key belongs in the mobile app.
This preview flow does not need S3. Suggestions require review before replacing
form entries and remain editable and unconfirmed; nothing creates a treatment.

Rebuild the native app after installing `expo-image-manipulator`. Camera, crop
handles and orientation still require testing on an Android phone. Automated tests
use synthetic data and mocked provider responses; no patient image was sent.

## Local verification result (2026-09-25)

- Mobile: format/lint/type checks, 20 tests, and Android JavaScript/assets export passed.
- Web: lint (one pre-existing ignored-work config warning), strict types, production
  build and 23 tests passed; two Redis integration tests skipped without REDIS_TEST_URL.
- All 52 browser checks passed using the existing local development server and
  synthetic API fixtures, across desktop and phone dimensions.
- Native Android image selection and end-to-end VPS document storage were not tested.
  No deployment or remote push was performed.

## Medicine-box scanning

Medicine search, Add to My Pharmacy and each prescription medicine editor now offer
**Scan a medicine box**. The same local crop and two explicit privacy/processing
confirmations apply. Remove pharmacy labels containing personal information.

Box extraction reads a visible name, strength, pack quantity/unit and complete
expiry date. Medicine search uses the name to find catalog candidates; the patient
selects the matching product and verifies strength. Reviewed packaging values carry
to the stock form, where remaining stock may differ from the printed pack count.
Scanning directly in that form requires checking the selected product matches.
Prescription lines receive only name and strength and clear the previous catalog
link; prescription dose, quantity and regimen are never inferred from packaging.
Month/year-only expiry stays blank. All suggestions remain editable before saving.

Deploy the updated API (POST `/api/v1/me/prescription-scan/box`) and rebuild the app.
The existing OpenAI key/model settings enable both scan modes. Native camera and
crop testing on a physical phone remains required.

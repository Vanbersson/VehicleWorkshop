# Attendance document storage

PDFs and images are stored as files. The database holds only name, MIME type, size, creation date, attendance ID and relative file path.

By default, the document directory is attendance-documents, beside the directory configured by local.image.upload. The folder is private and is not published by /images/**. Optionally configure local.document.upload with an absolute directory outside the public image directory.

Files use this structure:

    <document-directory>/<company>/<resale>/attendance/<attendance>/documents/<uuid>.<extension>

Back up both the document directory and the database.

## New installations

Apply crm_attendance_document.sql. It creates file_path and does not store file bytes.

## Installations that applied the earlier BLOB schema

Back up the database and put the API in maintenance mode. Start the updated API once with:

    --attendance.documents.migrate-from-database=true

The opt-in migration creates file_path, exports each existing file, verifies the copy byte for byte, then clears its database content. After every row has a valid path, it removes file_content. If migration is interrupted, original bytes or the verified file remain available; running with the flag again resumes unfinished exports. Remove the flag after successful migration.

Do not drop file_content manually before exporting existing documents. The migration has been prepared but is not automatically executed.

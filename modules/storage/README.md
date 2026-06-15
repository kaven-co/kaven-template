# Storage Module

Cloud storage provider abstraction with presigned URLs and per-tenant isolation. Supports AWS S3 and Cloudflare R2.

## Install

```bash
kaven module install storage
```

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `STORAGE_PROVIDER` | No | `s3` (default) or `r2` |
| `AWS_ACCESS_KEY_ID` | Yes | AWS or R2 access key |
| `AWS_SECRET_ACCESS_KEY` | Yes | AWS or R2 secret key |
| `AWS_S3_BUCKET` | Yes | Bucket name |
| `AWS_REGION` | No | AWS region (default: `us-east-1`) |
| `AWS_ENDPOINT_URL` | No | For R2: `https://<account>.r2.cloudflarestorage.com` |

## API

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/storage/presign` | Generate presigned upload URL |
| `DELETE` | `/api/storage/:objectId` | Delete object (tenant-scoped) |
| `GET` | `/api/storage` | List tenant objects |

## Frontend Components

- `FileUploader` — uploads directly to S3/R2 via presigned URL
- `FileGallery` — lists tenant files

## Architecture

Upload flow: client → `POST /presign` → S3/R2 directly via presigned URL. No files transit through the API server.

Files are keyed as `{tenantId}/{userId}/{timestamp}-{filename}`, enforcing multi-tenant isolation at the storage level.

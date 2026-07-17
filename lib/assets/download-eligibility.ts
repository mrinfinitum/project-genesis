import type { AssetDerivativeRecord, ProductionAsset, SourceFileRecord } from "@/lib/assets/asset-production";

export type AssetSourceAvailability =
  | "studio_managed_upload"
  | "public_remote_source"
  | "protected_remote_source"
  | "local_development_file"
  | "imported_manifest_reference"
  | "unavailable_external_source"
  | "missing_source"
  | "derivative_only"
  | "archived_source";

export type AssetDownloadReasonCode =
  | "source_available"
  | "source_not_uploaded"
  | "source_external_only"
  | "source_protected"
  | "source_missing"
  | "source_archived"
  | "source_local_only"
  | "source_not_available_in_environment"
  | "source_permission_denied"
  | "derivative_available"
  | "derivative_missing"
  | "preview_available"
  | "preview_missing"
  | "storage_provider_unavailable"
  | "invalid_asset_url"
  | "expired_signed_url"
  | "unsupported_download_type";

export type AssetDownloadEligibility = {
  canDownloadSource: boolean;
  canDownloadPreview: boolean;
  canDownloadDerivative: boolean;
  preferredDownloadType: "source" | "derivative" | "preview" | "none";
  sourceAvailability: AssetSourceAvailability;
  reasonCode: AssetDownloadReasonCode;
  userMessage: string;
  remediationAction: "download_source" | "download_derivative" | "open_preview" | "upload_source" | "record_external_source" | "restore_source" | "none";
  diagnosticContext: {
    assetId?: string;
    sourceFileId?: string;
    derivativeId?: string;
    storageProvider: string;
    storagePathKind: string;
    sourceStoragePath?: string;
    derivativeUrl?: string;
    previewUrl?: string;
    environment: string;
  };
};

const unsafePublicPatterns = [/^studio-private:\/\//i, /^\/Users\//i, /^\[local-source-redacted\]$/i];

export function isPublicRuntimeUrl(value?: string | null) {
  if (!value) return false;
  if (unsafePublicPatterns.some((pattern) => pattern.test(value))) return false;
  if (/^rbxassetid:\/\//i.test(value)) return false;
  return value.startsWith("/") || /^https?:\/\//i.test(value);
}

export function classifySourceAvailability(source?: SourceFileRecord | null): AssetSourceAvailability {
  if (!source) return "missing_source";
  if (source.archived) return "archived_source";
  const storagePath = source.storagePath.trim();
  if (!storagePath) return "missing_source";
  if (storagePath === "[local-source-redacted]" || storagePath.startsWith("/Users/")) return "local_development_file";
  if (storagePath.startsWith("studio-private://assets/") || storagePath.startsWith("studio-private://supabase/") || storagePath.startsWith("/uploads/")) return "studio_managed_upload";
  if (/^https?:\/\//i.test(storagePath)) return "public_remote_source";
  if (/^rbxassetid:\/\//i.test(storagePath)) return "protected_remote_source";
  if (/^[\w.-]+\/.+/i.test(storagePath)) return "imported_manifest_reference";
  return "unavailable_external_source";
}

export function sourceStorageProvider(source?: SourceFileRecord | null) {
  const storagePath = source?.storagePath ?? "";
  if (!source) return "none";
  if (storagePath.startsWith("studio-private://assets/")) return "studio-private-local";
  if (storagePath.startsWith("studio-private://supabase/")) return "supabase-storage";
  if (storagePath.startsWith("/uploads/")) return "public-upload";
  if (/^https?:\/\//i.test(storagePath)) return "remote-url";
  if (/^rbxassetid:\/\//i.test(storagePath)) return "roblox-asset";
  if (storagePath === "[local-source-redacted]" || storagePath.startsWith("/Users/")) return "local-development";
  if (/^[\w.-]+\/.+/i.test(storagePath)) return "imported-manifest";
  return "unknown";
}

function sourceReason(availability: AssetSourceAvailability): Pick<AssetDownloadEligibility, "reasonCode" | "userMessage" | "remediationAction"> {
  switch (availability) {
    case "studio_managed_upload":
    case "public_remote_source":
      return { reasonCode: "source_available", userMessage: "Studio can deliver this source version.", remediationAction: "download_source" };
    case "protected_remote_source":
      return { reasonCode: "source_protected", userMessage: "This source is protected by an external provider and cannot be downloaded directly from Studio.", remediationAction: "record_external_source" };
    case "local_development_file":
      return { reasonCode: "source_local_only", userMessage: "This source exists only as a local development reference. Upload a Studio-managed source to enable downloads.", remediationAction: "upload_source" };
    case "imported_manifest_reference":
      return { reasonCode: "source_external_only", userMessage: "This record references an external project source from an import manifest. Upload or publish a Studio-managed source copy to enable source downloads.", remediationAction: "upload_source" };
    case "archived_source":
      return { reasonCode: "source_archived", userMessage: "This source version is archived. Restore it before downloading.", remediationAction: "restore_source" };
    case "missing_source":
      return { reasonCode: "source_missing", userMessage: "No source file has been uploaded for this asset.", remediationAction: "upload_source" };
    case "derivative_only":
      return { reasonCode: "source_not_uploaded", userMessage: "Only derivative files are available for this asset.", remediationAction: "download_derivative" };
    default:
      return { reasonCode: "source_not_available_in_environment", userMessage: "This source is not available in the current Studio environment.", remediationAction: "upload_source" };
  }
}

export function resolveAssetDownloadEligibility(input: {
  asset?: ProductionAsset | null;
  sourceVersion?: SourceFileRecord | null;
  derivative?: AssetDerivativeRecord | null;
  environment?: string;
  userAccess?: "studio" | "public" | "admin";
}): AssetDownloadEligibility {
  const source = input.sourceVersion ?? null;
  const availability = source ? classifySourceAvailability(source) : input.derivative ? "derivative_only" : "missing_source";
  const derivativeUrl = input.derivative?.publicUrl || "";
  const previewUrl = source?.previewUrl || "";
  const canDownloadSource = availability === "studio_managed_upload" || availability === "public_remote_source";
  const canDownloadDerivative = isPublicRuntimeUrl(derivativeUrl);
  const canDownloadPreview = isPublicRuntimeUrl(previewUrl);
  const base = sourceReason(availability);

  if (!canDownloadSource && canDownloadDerivative) {
    return {
      canDownloadSource,
      canDownloadPreview,
      canDownloadDerivative,
      preferredDownloadType: "derivative",
      sourceAvailability: availability,
      reasonCode: "derivative_available",
      userMessage: `${base.userMessage} A published derivative is available instead.`,
      remediationAction: "download_derivative",
      diagnosticContext: {
        assetId: input.asset?.id ?? source?.assetId,
        sourceFileId: source?.id,
        derivativeId: input.derivative?.id,
        storageProvider: sourceStorageProvider(source),
        storagePathKind: availability,
        sourceStoragePath: source?.storagePath,
        derivativeUrl,
        previewUrl,
        environment: input.environment ?? "studio"
      }
    };
  }

  if (!canDownloadSource && !canDownloadDerivative && canDownloadPreview) {
    return {
      canDownloadSource,
      canDownloadPreview,
      canDownloadDerivative,
      preferredDownloadType: "preview",
      sourceAvailability: availability,
      reasonCode: "preview_available",
      userMessage: `${base.userMessage} A preview is available for review.`,
      remediationAction: "open_preview",
      diagnosticContext: {
        assetId: input.asset?.id ?? source?.assetId,
        sourceFileId: source?.id,
        derivativeId: input.derivative?.id,
        storageProvider: sourceStorageProvider(source),
        storagePathKind: availability,
        sourceStoragePath: source?.storagePath,
        derivativeUrl,
        previewUrl,
        environment: input.environment ?? "studio"
      }
    };
  }

  return {
    canDownloadSource,
    canDownloadPreview,
    canDownloadDerivative,
    preferredDownloadType: canDownloadSource ? "source" : "none",
    sourceAvailability: availability,
    reasonCode: base.reasonCode,
    userMessage: base.userMessage,
    remediationAction: base.remediationAction,
    diagnosticContext: {
      assetId: input.asset?.id ?? source?.assetId,
      sourceFileId: source?.id,
      derivativeId: input.derivative?.id,
      storageProvider: sourceStorageProvider(source),
      storagePathKind: availability,
      sourceStoragePath: source?.storagePath,
      derivativeUrl,
      previewUrl,
      environment: input.environment ?? "studio"
    }
  };
}

export function sourceDownloadHttpStatus(reasonCode: AssetDownloadReasonCode) {
  if (reasonCode === "source_missing" || reasonCode === "source_not_uploaded") return 404;
  if (reasonCode === "source_archived") return 410;
  if (reasonCode === "source_permission_denied" || reasonCode === "source_protected") return 403;
  if (reasonCode === "storage_provider_unavailable") return 503;
  if (reasonCode === "invalid_asset_url" || reasonCode === "unsupported_download_type") return 400;
  if (reasonCode === "source_external_only" || reasonCode === "source_local_only" || reasonCode === "source_not_available_in_environment") return 409;
  return 409;
}

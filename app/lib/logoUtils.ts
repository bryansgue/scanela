const SUPABASE_PUBLIC_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "") ?? "";
const STORAGE_PUBLIC_PREFIX = SUPABASE_PUBLIC_URL
	? `${SUPABASE_PUBLIC_URL}/storage/v1/object/public/`
	: "";

const KNOWN_BUCKET_PREFIXES = [
	"menu-images/",
	"images_public/",
	"menus_public/",
	"public/menu-images/",
	"public/images_public/",
	"public/menus_public/",
];

const isHttpUrl = (value: string) => /^https?:\/\//i.test(value);
const isProtocolRelative = (value: string) => value.startsWith("//");
const isDataUrl = (value: string) => value.startsWith("data:");

const buildStorageUrlFromRelativePath = (path: string): string | null => {
	if (!STORAGE_PUBLIC_PREFIX) return null;
	return `${STORAGE_PUBLIC_PREFIX}${path.replace(/^\/+/, "")}`;
};

export const normalizeLogoUrl = (raw?: string | null): string | null => {
	if (!raw) return null;
	const trimmed = raw.trim();
	if (!trimmed) return null;

	if (isDataUrl(trimmed) || isHttpUrl(trimmed)) {
		return trimmed;
	}

	if (isProtocolRelative(trimmed)) {
		return `https:${trimmed}`;
	}

	if (trimmed.startsWith("/storage/v1/object/public/")) {
		return SUPABASE_PUBLIC_URL ? `${SUPABASE_PUBLIC_URL}${trimmed}` : null;
	}

	if (trimmed.startsWith("storage/v1/object/public/")) {
		return SUPABASE_PUBLIC_URL ? `${SUPABASE_PUBLIC_URL}/${trimmed}` : null;
	}

	const bucketPrefix = KNOWN_BUCKET_PREFIXES.find((prefix) =>
		trimmed.toLowerCase().startsWith(prefix)
	);

	if (bucketPrefix) {
		const normalizedPath = bucketPrefix.startsWith("public/")
			? trimmed.slice("public/".length)
			: trimmed;
		return buildStorageUrlFromRelativePath(normalizedPath);
	}

	return null;
};

export const hasValidLogoUrl = (raw?: string | null) => normalizeLogoUrl(raw) !== null;

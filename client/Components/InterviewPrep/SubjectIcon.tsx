"use client";
import { FC, useEffect, useState } from "react";
import Image from "next/image";
import { BookOpen } from "lucide-react";

interface SubjectIconProps {
  /** Stored icon: an image URL/path, or an emoji glyph. */
  icon?: string;
  className?: string;
  /** Intrinsic pixel size for the image (display size is driven by className). */
  size?: number;
}

/** An emoji/symbol contains non-ASCII characters; a URL/path does not. */
const isEmoji = (value: string): boolean => /[^\u0000-\u007F]/.test(value);

/**
 * Renders a subject's icon: an <Image> when an image source is given, the
 * literal glyph when an emoji is given, or a BookOpen default when the icon is
 * missing or the image fails to load.
 */
const SubjectIcon: FC<SubjectIconProps> = ({ icon, className, size = 24 }) => {
  const trimmed = icon?.trim();
  const [errored, setErrored] = useState<boolean>(false);

  // Reset the error state if the icon source changes.
  useEffect(() => {
    setErrored(false);
  }, [trimmed]);

  if (!trimmed || errored) {
    return <BookOpen className={className} />;
  }

  // Emoji / symbol — render the glyph itself.
  if (isEmoji(trimmed)) {
    return (
      <span className={className} aria-hidden="true">
        {trimmed}
      </span>
    );
  }

  // Treat the value as an image source. `unoptimized` avoids the remote-domain
  // allowlist so any admin-provided URL works without next.config changes.
  return (
    <Image
      src={trimmed}
      alt=""
      width={size}
      height={size}
      unoptimized
      className={className}
      onError={() => setErrored(true)}
    />
  );
};

export default SubjectIcon;

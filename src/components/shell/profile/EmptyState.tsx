import Link from 'next/link'
import React from 'react'


type EmptyStateProps = {
  icon: string
  title: string
    description?: string
    actionHref?: string
    actionLabel?: string
}
const EmptyState = ({
  icon,
  title,
  description,
  actionHref,
  actionLabel,
}: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center w-full justify-center text-center py-2xl gap-sm">
      <span className="material-symbols-outlined text-[32px] text-outline">
        {icon}
      </span>
      <p className="text-label-md text-on-surface">{title}</p>
      {description && (
        <p className="text-label-sm text-on-surface-variant ">
          {description}
        </p>
      )}
      {actionHref && actionLabel && (
        <Link
          href={actionHref}
          className="mt-sm px-md py-sm rounded-full border-2 border-primary text-primary text-label-md hover-lift transition-colors"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}

export default EmptyState


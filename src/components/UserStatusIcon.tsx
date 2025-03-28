import { User } from "lucide-react"
import styles from "../styles/UserStatusIcon.module.css"

type Size = "sm" | "md" | "lg"

interface UserStatusIconProps {
  status: string
  size?: Size
  className?: string
}

export function UserStatusIcon({ status = "disconnected", size = "md", className }: UserStatusIconProps) {
  return (
    <div
      className={`${styles.container} ${className || ""}`}
      id={size === "lg" ? "status-indicator" : undefined}
      data-status={size === "lg" ? status : undefined}
    >
      {/* Profile Icon */}
      <div className={`${styles.profileIcon} ${styles[size]}`}>
        <User className={size === "sm" ? styles.sm : size === "md" ? styles.md : styles.lg} />
      </div>

      {/* Status Indicator */}
      <span
        className={`${styles.statusIndicator} ${styles[status]} ${styles[size]}`}
        role="status"
      />
    </div>
  )
}


import { LoginPage } from '#/features/auth/pages/LoginPage'
import { createFileRoute } from '@tanstack/react-router'

// Bridge  component from features into Route
export const Route = createFileRoute('/login')({
  component: LoginPage,
})

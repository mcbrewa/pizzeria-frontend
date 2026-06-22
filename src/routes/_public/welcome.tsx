import { createFileRoute } from '@tanstack/react-router'
import WelcomePage from '#/pages/WelcomePage'

export const Route = createFileRoute('/_public/welcome')({
  component: WelcomePage,
})

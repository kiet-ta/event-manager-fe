import { createFileRoute } from '@tanstack/react-router'
import { SendOtpForm } from '#/features/auth/components/SendOtpForm'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Send OTP</CardTitle>
        </CardHeader>
        <CardContent>
          <SendOtpForm />
        </CardContent>
      </Card>
    </div>
  )
}

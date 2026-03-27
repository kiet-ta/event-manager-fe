import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { SendOtpForm } from '../components/SendOtpForm'

export const LoginPage = () => {
    // Login direct, if already login, direct to homepage

    return (
        <div
            className="flex min-h-screen
      items-center justify-center bg-gray-50"
        >
            <Card className="w-[400x]">
                <CardHeader>
                    <CardTitle
                        className="text-2xl
      text-center"
                    >
                        Chào mừng quay trở lại
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {/* 2. Implement main bussiness*/}
                    <SendOtpForm />

                    <div className="mt-4 text-center text-sm text-gray-500">
                        Bằng cách đăng nhập, bạn đồng ý với Điều khoản của chúng tôi.
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

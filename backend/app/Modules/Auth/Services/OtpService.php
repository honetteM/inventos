<?php

namespace App\Modules\Auth\Services;

use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class OtpService
{
    public function generate(User $user): string
    {
        $otp = (string) random_int(100000, 999999);
        $user->update([
            'otp_code' => $otp,
            'otp_expires_at' => now()->addMinutes(10),
        ]);

        Cache::put("otp:{$user->id}", $otp, 600);

        return $otp;
    }

    public function verify(User $user, string $otp): bool
    {
        if ($user->otp_code !== $otp) {
            return false;
        }

        if (!$user->otp_expires_at || $user->otp_expires_at->isPast()) {
            return false;
        }

        $user->update([
            'otp_code' => null,
            'otp_expires_at' => null,
            'phone_verified_at' => now(),
        ]);

        Cache::forget("otp:{$user->id}");

        return true;
    }

    public function send(User $user): void
    {
        $otp = $this->generate($user);
        // TODO: Integrate SMS provider (Twilio, Rwanda SMS, etc.)
        Log::info("OTP for user {$user->id}: {$otp}");
    }
}

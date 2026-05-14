<?php

namespace App\Modules\Auth\Services;

use App\Models\User;
use App\Modules\Auth\Models\Tenant;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Spatie\Permission\Models\Role;

class AuthService
{
    public function __construct(
        private readonly OtpService $otpService
    ) {}

    public function register(array $data): User
    {
        $tenant = Tenant::create([
            'name' => $data['company_name'] ?? $data['name'] . "'s Company",
            'slug' => Str::slug($data['company_name'] ?? $data['name'] . '-' . Str::random(4)),
            'email' => $data['email'],
        ]);

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => $data['password'],
            'tenant_id' => $tenant->id,
            'phone' => $data['phone'] ?? null,
        ]);

        $role = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        $user->assignRole($role);

        return $user;
    }

    public function login(string $email, string $password, ?string $deviceName = null): array
    {
        $user = User::where('email', $email)->active()->first();

        if (!$user || !Hash::check($password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $token = $user->createToken($deviceName ?? 'auth-token')->plainTextToken;

        return [
            'user' => $user->load('tenant', 'roles'),
            'token' => $token,
        ];
    }

    public function logout(User $user, ?string $tokenId = null): void
    {
        if ($tokenId) {
            $user->tokens()->where('id', $tokenId)->delete();
        } else {
            $user->currentAccessToken()->delete();
        }
    }

    public function sendPasswordResetLink(string $email): string
    {
        $status = Password::sendResetLink(['email' => $email]);

        if ($status !== Password::RESET_LINK_SENT) {
            throw ValidationException::withMessages([
                'email' => [__($status)],
            ]);
        }

        return __($status);
    }

    public function resetPassword(array $data): string
    {
        $status = Password::reset(
            $data,
            function (User $user, string $password) {
                $user->forceFill([
                    'password' => $password,
                ])->setRememberToken(Str::random(60));

                $user->save();

                event(new PasswordReset($user));
            }
        );

        if ($status !== Password::PASSWORD_RESET) {
            throw ValidationException::withMessages([
                'email' => [__($status)],
            ]);
        }

        return __($status);
    }

    public function sendOtp(User $user): void
    {
        $this->otpService->send($user);
    }

    public function verifyOtp(User $user, string $otp): bool
    {
        return $this->otpService->verify($user, $otp);
    }
}

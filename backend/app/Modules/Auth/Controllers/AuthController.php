<?php

namespace App\Modules\Auth\Controllers;

use App\Modules\Auth\Requests\ForgotPasswordRequest;
use App\Modules\Auth\Requests\LoginRequest;
use App\Modules\Auth\Requests\RegisterRequest;
use App\Modules\Auth\Requests\ResetPasswordRequest;
use App\Modules\Auth\Requests\VerifyOtpRequest;
use App\Modules\Auth\Resources\UserResource;
use App\Modules\Auth\Services\AuthService;
use App\Services\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class AuthController extends Controller
{
    public function __construct(
        private readonly AuthService $authService
    ) {}

    public function register(RegisterRequest $request): JsonResponse
    {
        $user = $this->authService->register($request->validated());

        AuditService::log('registered', get_class($user), $user->id, null, ['email' => $user->email]);

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'message' => 'Registration successful',
            'user' => new UserResource($user->load('tenant', 'roles')),
            'token' => $token,
        ], 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $result = $this->authService->login(
            $request->input('email'),
            $request->input('password'),
            $request->input('device_name')
        );

        AuditService::log('login', get_class($result['user']), $result['user']->id);

        return response()->json([
            'message' => 'Login successful',
            'user' => new UserResource($result['user']->load('tenant', 'roles', 'permissions')),
            'token' => $result['token'],
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $user = $request->user();

        AuditService::log('logout', get_class($user), $user->id);

        $this->authService->logout($user);

        return response()->json(['message' => 'Logged out successfully']);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->load('tenant', 'roles', 'permissions');

        return response()->json([
            'user' => new UserResource($user),
        ]);
    }

    public function forgotPassword(ForgotPasswordRequest $request): JsonResponse
    {
        $message = $this->authService->sendPasswordResetLink($request->input('email'));

        return response()->json(['message' => $message]);
    }

    public function resetPassword(ResetPasswordRequest $request): JsonResponse
    {
        $message = $this->authService->resetPassword($request->validated());

        return response()->json(['message' => $message]);
    }

    public function sendOtp(Request $request): JsonResponse
    {
        $user = $request->user();

        $this->authService->sendOtp($user);

        return response()->json(['message' => 'OTP sent successfully']);
    }

    public function verifyOtp(VerifyOtpRequest $request): JsonResponse
    {
        $user = $request->user();

        $verified = $this->authService->verifyOtp($user, $request->input('otp'));

        if (!$verified) {
            return response()->json(['message' => 'Invalid or expired OTP'], 422);
        }

        return response()->json(['message' => 'OTP verified successfully']);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'phone' => 'sometimes|string|max:20',
            'locale' => 'sometimes|string|size:2',
        ]);

        $user->update($validated);

        return response()->json([
            'message' => 'Profile updated',
            'user' => new UserResource($user->fresh()->load('tenant', 'roles')),
        ]);
    }
}

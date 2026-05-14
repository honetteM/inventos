<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class TenantMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && $user->tenant_id) {
            $tenant = $user->tenant;

            if (!$tenant || !$tenant->is_active) {
                return response()->json(['message' => 'Tenant is inactive or not found'], 403);
            }

            $request->merge(['current_tenant' => $tenant]);
        }

        return $next($request);
    }
}

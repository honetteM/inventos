<?php

if (!function_exists('tenant_id')) {
    function tenant_id(): ?int
    {
        $request = request();
        $user = $request?->user();
        if ($user && $user->tenant_id) {
            return $user->tenant_id;
        }

        $header = $request?->header('X-Tenant-Id');
        if ($header) {
            return (int) $header;
        }

        return null;
    }
}

<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;

class CloudinaryService
{
    protected string $cloudName;
    protected string $uploadPreset;

    public function __construct()
    {
        $this->cloudName = config('cloudinary.cloud_name', env('CLOUDINARY_CLOUD_NAME'));
        $this->uploadPreset = config('cloudinary.upload_preset', env('CLOUDINARY_UPLOAD_PRESET'));
    }

    public function upload(UploadedFile $file, array $options = []): string
    {
        if (!extension_loaded('curl')) {
            throw new \RuntimeException('cURL extension is not installed on the server');
        }

        $response = Http::attach(
            'file',
            fopen($file->getPathname(), 'r'),
            $file->getClientOriginalName()
        )->post("https://api.cloudinary.com/v1_1/{$this->cloudName}/image/upload", [
            'upload_preset' => $this->uploadPreset,
            'folder' => $options['folder'] ?? null,
        ]);

        if ($response->failed()) {
            $msg = $response->json('error.message') ?? $response->body();
            throw new \RuntimeException("Cloudinary upload failed: {$msg}");
        }

        return $response->json('secure_url');
    }

    public function uploadFromPath(string $path, array $options = []): string
    {
        if (!file_exists($path)) {
            throw new \RuntimeException("File not found: {$path}");
        }

        if (!extension_loaded('curl')) {
            throw new \RuntimeException('cURL extension is not installed on the server');
        }

        $mime = mime_content_type($path) ?: 'image/jpeg';
        $name = basename($path);

        $response = Http::attach(
            'file',
            fopen($path, 'r'),
            $name
        )->post("https://api.cloudinary.com/v1_1/{$this->cloudName}/image/upload", [
            'upload_preset' => $this->uploadPreset,
            'folder' => $options['folder'] ?? null,
        ]);

        if ($response->failed()) {
            $msg = $response->json('error.message') ?? $response->body();
            throw new \RuntimeException("Cloudinary upload failed: {$msg}");
        }

        return $response->json('secure_url');
    }
}

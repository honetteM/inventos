<?php

namespace App\Modules\Inventory\Controllers;

use App\Http\Controllers\Controller;
use App\Services\CloudinaryService;
use Illuminate\Http\Request;

class UploadController extends Controller
{
    public function upload(Request $request, CloudinaryService $cloudinary)
    {
        $request->validate([
            'file' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
        ]);

        $file = $request->file('file');

        try {
            $url = $cloudinary->upload($file, [
                'folder' => 'inventos/invoices',
            ]);

            return response()->json([
                'message' => 'Image uploaded successfully',
                'data' => [
                    'url' => $url,
                    'original_name' => $file->getClientOriginalName(),
                    'size' => $file->getSize(),
                ],
            ]);
        } catch (\RuntimeException $e) {
            return response()->json([
                'message' => 'Upload failed',
                'error' => $e->getMessage(),
                'hint' => 'Check that CLOUDINARY_CLOUD_NAME and CLOUDINARY_UPLOAD_PRESET are set in .env and the upload preset allows unsigned uploads',
            ], 500);
        }
    }
}

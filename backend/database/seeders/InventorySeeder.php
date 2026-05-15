<?php

namespace Database\Seeders;

use App\Modules\Auth\Models\Tenant;
use App\Modules\Inventory\Models\Category;
use App\Modules\Inventory\Models\Warehouse;
use Illuminate\Database\Seeder;

class InventorySeeder extends Seeder
{
    public function run(): void
    {
        $tenants = Tenant::all();

        if ($tenants->isEmpty()) {
            $this->command->warn('No tenants found. Skipping inventory seed.');
            return;
        }

        foreach ($tenants as $tenant) {
            $mainWh = Warehouse::create([
                'tenant_id' => $tenant->id,
                'name' => 'Main Warehouse',
                'code' => 'MAIN',
                'description' => 'Primary storage location',
                'address' => 'Kigali, Rwanda',
                'is_active' => true,
            ]);

            Warehouse::create([
                'tenant_id' => $tenant->id,
                'name' => 'Secondary Warehouse',
                'code' => 'SEC',
                'description' => 'Overflow and bulk storage',
                'is_active' => true,
            ]);

            $electronics = Category::create([
                'tenant_id' => $tenant->id,
                'name' => 'Electronics',
                'slug' => 'electronics',
                'description' => 'Electronic devices and accessories',
                'is_active' => true,
            ]);

            Category::create([
                'tenant_id' => $tenant->id,
                'name' => 'Clothing',
                'slug' => 'clothing',
                'description' => 'Apparel and fashion items',
                'is_active' => true,
            ]);

            Category::create([
                'tenant_id' => $tenant->id,
                'parent_id' => $electronics->id,
                'name' => 'Phone Accessories',
                'slug' => 'phone-accessories',
                'description' => 'Chargers, cases, screen protectors',
                'is_active' => true,
            ]);

            $this->command->info("Seeded inventory for tenant: {$tenant->name}");
        }
    }
}

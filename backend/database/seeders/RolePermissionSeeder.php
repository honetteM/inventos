<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        $superAdmin = Role::create(['name' => 'super-admin', 'guard_name' => 'web']);
        $admin = Role::create(['name' => 'admin', 'guard_name' => 'web']);
        $manager = Role::create(['name' => 'manager', 'guard_name' => 'web']);
        $staff = Role::create(['name' => 'staff', 'guard_name' => 'web']);

        $permissions = [
            // Users
            'view users', 'create users', 'edit users', 'delete users',
            // Inventory
            'view products', 'create products', 'edit products', 'delete products',
            'view categories', 'create categories', 'edit categories', 'delete categories',
            'view warehouses', 'create warehouses', 'edit warehouses', 'delete warehouses',
            'view stock', 'adjust stock', 'move stock',
            // Sales
            'view sales', 'create sales', 'edit sales', 'delete sales',
            'view invoices', 'create invoices', 'edit invoices', 'delete invoices',
            'view quotations', 'create quotations', 'edit quotations', 'delete quotations',
            'view receipts', 'create receipts',
            // Accounting
            'view accounts', 'create accounts', 'edit accounts',
            'view journal entries', 'create journal entries',
            'view expenses', 'create expenses', 'edit expenses',
            'view reports',
            // Suppliers
            'view suppliers', 'create suppliers', 'edit suppliers', 'delete suppliers',
        ];

        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission, 'guard_name' => 'web']);
        }

        $superAdmin->givePermissionTo(Permission::all());
        $admin->givePermissionTo(Permission::all());
        $manager->givePermissionTo([
            'view users',
            'view products', 'create products', 'edit products',
            'view categories', 'create categories', 'edit categories',
            'view warehouses',
            'view stock', 'adjust stock', 'move stock',
            'view sales', 'create sales',
            'view invoices', 'create invoices',
            'view quotations', 'create quotations',
            'view receipts', 'create receipts',
            'view expenses', 'create expenses',
            'view reports',
            'view suppliers', 'create suppliers', 'edit suppliers',
        ]);
        $staff->givePermissionTo([
            'view products',
            'view stock', 'move stock',
            'view sales', 'create sales',
            'view invoices', 'create invoices',
        ]);
    }
}

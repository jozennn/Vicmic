<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class UserSeeder extends Seeder
{
    public function run()
    {
        // Clear existing data to prevent duplicates
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        User::truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $users = [
            // --- IT / ADMIN ---
            ['name' => 'Admin User', 'email' => 'admin@vision.com', 'role' => 'admin', 'dept' => 'IT', 'pos' => 'System Admin', 'rate' => 2500],
            ['name' => 'Admin User', 'email' => 'jdlarkin20@gmail.com', 'role' => 'admin', 'dept' => 'IT', 'pos' => 'System Admin', 'rate' => 2500],

            // --- MANAGEMENT ---
            ['name' => 'General Manager', 'email' => 'mgmt@vision.com', 'role' => 'manager', 'dept' => 'Management', 'pos' => 'GM', 'rate' => 3000],

            // --- HR ---
            ['name' => 'Grace HR Head', 'email' => 'hr_head@vision.com', 'role' => 'dept_head', 'dept' => 'HR', 'pos' => 'HR Manager', 'rate' => 1800],
            ['name' => 'Holly HR Staff', 'email' => 'hr_staff@vision.com', 'role' => 'hr_employee', 'dept' => 'HR', 'pos' => 'HR Assistant', 'rate' => 800],

            // --- SALES ---
            ['name' => 'Victor Sales Head', 'email' => 'sales_head@vision.com', 'role' => 'dept_head', 'dept' => 'Sales', 'pos' => 'Sales Head', 'rate' => 1500],
            ['name' => 'Sam Sales Staff', 'email' => 'sales_staff@vision.com', 'role' => 'sales_employee', 'dept' => 'Sales', 'pos' => 'Sales Associate', 'rate' => 700],

            // --- LOGISTICS / INVENTORY ---
            ['name' => 'Larry Logistics Head', 'email' => 'logistics_head@vision.com', 'role' => 'dept_head', 'dept' => 'Logistics', 'pos' => 'Logistics Manager', 'rate' => 1400],
            ['name' => 'Luke Logistics Staff', 'email' => 'logistics_staff@vision.com', 'role' => 'logistics_employee', 'dept' => 'Logistics', 'pos' => 'Warehouse Staff', 'rate' => 650],

            // --- ENGINEERING ---
            ['name' => 'Engr. David Chief', 'email' => 'eng_head@vision.com', 'role' => 'dept_head', 'dept' => 'Engineering', 'pos' => 'Chief Engineer', 'rate' => 2200],
            ['name' => 'Engr. Eric Staff', 'email' => 'eng_staff@vision.com', 'role' => 'engineering_employee', 'dept' => 'Engineering', 'pos' => 'Junior Engineer', 'rate' => 1200],

            // --- ACCOUNTING / PROCUREMENT ---
            ['name' => 'Alice Accounting Head', 'email' => 'accounting_head@vision.com', 'role' => 'dept_head', 'dept' => 'Accounting/Procurement', 'pos' => 'Procurement Head', 'rate' => 1700],
            ['name' => 'Arnold Accounting Staff', 'email' => 'accounting_staff@vision.com', 'role' => 'accounting_employee', 'dept' => 'Accounting/Procurement', 'pos' => 'Purchasing Clerk', 'rate' => 850],
        ];

        foreach ($users as $u) {
            $user = User::create([
                'name' => $u['name'],
                'email' => $u['email'],
                'role' => $u['role'],
                'department' => $u['dept'],
                'password' => Hash::make('password123'),
                'status' => 'Active',
            ]);

            $tableName = $this->getTableName($u['dept']);

            if ($tableName) {
                DB::table($tableName)->insert([
                    'user_id' => $user->id,
                    'position' => $u['pos'],
                    'rate_per_day' => $u['rate'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }

    private function getTableName($dept)
    {
        return match ($dept) {
            'Engineering'            => 'engineering_dept_table',
            'Sales'                  => 'sales_dept_table',
            'HR'                     => 'hr_dept_table',
            'Management'             => 'management_dept_table',
            'Logistics'              => 'logistics_dept_table',
            'IT'                     => 'it_dept_table',
            'Accounting/Procurement' => 'accounting_dept_table',
            default                  => null, 
        };
    }
}
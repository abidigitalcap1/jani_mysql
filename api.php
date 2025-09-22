<?php
session_start();
require_once 'db.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$action = $_GET['action'] ?? '';

try {
    switch ($action) {
        case 'login':
            handleLogin();
            break;
        case 'logout':
            handleLogout();
            break;
        case 'getSession':
            handleGetSession();
            break;
        case 'getDashboardStats':
            handleGetDashboardStats();
            break;
        case 'getCustomers':
            handleGetCustomers();
            break;
        case 'getMenuItems':
            handleGetMenuItems();
            break;
        case 'createOrder':
            handleCreateOrder();
            break;
        case 'getCustomerHistory':
            handleGetCustomerHistory();
            break;
        case 'getCustomerOrders':
            handleGetCustomerOrders();
            break;
        case 'getOrderItems':
            handleGetOrderItems();
            break;
        case 'getExpenses':
            handleGetExpenses();
            break;
        case 'addExpense':
            handleAddExpense();
            break;
        case 'getPendingOrders':
            handleGetPendingOrders();
            break;
        case 'getOrderPayments':
            handleGetOrderPayments();
            break;
        case 'addPayment':
            handleAddPayment();
            break;
        case 'getSupplyParties':
            handleGetSupplyParties();
            break;
        case 'getPartyNames':
            handleGetPartyNames();
            break;
        case 'addSupplyBill':
            handleAddSupplyBill();
            break;
        case 'getPartyLedger':
            handleGetPartyLedger();
            break;
        case 'addPartyTransaction':
            handleAddPartyTransaction();
            break;
        default:
            throw new Exception('Invalid action');
    }
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['error' => $e->getMessage()]);
}

function handleLogin() {
    global $pdo;
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['email']) || !isset($input['password'])) {
        throw new Exception('Email and password are required');
    }
    
    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->execute([$input['email']]);
    $user = $stmt->fetch();
    
    if (!$user || !password_verify($input['password'], $user['password_hash'])) {
        throw new Exception('Invalid credentials');
    }
    
    $_SESSION['user_id'] = $user['user_id'];
    $_SESSION['email'] = $user['email'];
    
    echo json_encode(['success' => true, 'user' => ['email' => $user['email']]]);
}

function handleLogout() {
    session_destroy();
    echo json_encode(['success' => true]);
}

function handleGetSession() {
    if (isset($_SESSION['user_id'])) {
        echo json_encode(['session' => true, 'user' => ['email' => $_SESSION['email']]]);
    } else {
        echo json_encode(['session' => false]);
    }
}

function handleGetDashboardStats() {
    global $pdo;
    
    $today = date('Y-m-d');
    
    // Today's orders count
    $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM orders WHERE DATE(order_date) = ?");
    $stmt->execute([$today]);
    $ordersCount = $stmt->fetch()['count'];
    
    // Today's sales (total amount from today's orders)
    $stmt = $pdo->prepare("SELECT COALESCE(SUM(total_amount), 0) as sales FROM orders WHERE DATE(order_date) = ?");
    $stmt->execute([$today]);
    $todaysSales = $stmt->fetch()['sales'];
    
    // Total pending amount across all orders
    $stmt = $pdo->prepare("SELECT COALESCE(SUM(remaining_amount), 0) as pending FROM orders WHERE status != 'Fulfilled'");
    $stmt->execute();
    $pendingAmount = $stmt->fetch()['pending'];
    
    // Today's expenses
    $stmt = $pdo->prepare("SELECT COALESCE(SUM(amount), 0) as expenses FROM expenses WHERE DATE(expense_date) = ?");
    $stmt->execute([$today]);
    $todaysExpenses = $stmt->fetch()['expenses'];
    
    echo json_encode([
        'ordersCount' => $ordersCount,
        'todaysSales' => $todaysSales,
        'pendingAmount' => $pendingAmount,
        'todaysExpenses' => $todaysExpenses
    ]);
}

function handleGetCustomers() {
    global $pdo;
    $search = $_GET['search'] ?? '';
    
    $stmt = $pdo->prepare("SELECT * FROM customers WHERE name LIKE ? OR phone LIKE ? LIMIT 10");
    $searchTerm = "%$search%";
    $stmt->execute([$searchTerm, $searchTerm]);
    
    echo json_encode($stmt->fetchAll());
}

function handleGetMenuItems() {
    global $pdo;
    $stmt = $pdo->query("SELECT * FROM menu_items ORDER BY name");
    echo json_encode($stmt->fetchAll());
}

function handleCreateOrder() {
    global $pdo;
    $input = json_decode(file_get_contents('php://input'), true);
    
    $pdo->beginTransaction();
    
    try {
        $customerId = null;
        
        // Handle customer creation or selection
        if ($input['isAddingNewCustomer']) {
            $stmt = $pdo->prepare("INSERT INTO customers (name, phone, address) VALUES (?, ?, '')");
            $stmt->execute([$input['newCustomer']['name'], $input['newCustomer']['phone']]);
            $customerId = $pdo->lastInsertId();
        } else {
            $customerId = $input['customerId'];
        }
        
        // Create order
        $order = $input['order'];
        $stmt = $pdo->prepare("
            INSERT INTO orders (customer_id, order_type, order_date, delivery_date, delivery_time, 
                              total_amount, advance_payment, remaining_amount, delivery_address, notes, status) 
            VALUES (?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $customerId,
            $order['order_type'],
            $order['delivery_date'],
            $order['delivery_time'],
            $order['total_amount'],
            $order['advance_payment'],
            $order['total_amount'] - $order['advance_payment'],
            $order['delivery_address'],
            $order['notes'],
            $order['status']
        ]);
        
        $orderId = $pdo->lastInsertId();
        
        // Add order items
        foreach ($input['items'] as $item) {
            $stmt = $pdo->prepare("
                INSERT INTO order_items (order_id, item_id, custom_item_name, quantity, unit_price) 
                VALUES (?, ?, ?, ?, ?)
            ");
            $stmt->execute([
                $orderId,
                $item['item_id'],
                $item['custom_item_name'],
                $item['quantity'],
                $item['unit_price']
            ]);
        }
        
        // Add initial payment if advance payment > 0
        if ($order['advance_payment'] > 0) {
            $stmt = $pdo->prepare("
                INSERT INTO payments (order_id, amount, payment_date, notes) 
                VALUES (?, ?, NOW(), 'Initial advance payment')
            ");
            $stmt->execute([$orderId, $order['advance_payment']]);
        }
        
        $pdo->commit();
        echo json_encode(['success' => true, 'orderId' => $orderId]);
        
    } catch (Exception $e) {
        $pdo->rollBack();
        throw $e;
    }
}

function handleGetCustomerHistory() {
    global $pdo;
    $search = $_GET['search'] ?? '';
    
    $sql = "
        SELECT 
            c.customer_id,
            c.name,
            c.phone,
            c.address,
            COUNT(o.order_id) as total_orders,
            COALESCE(SUM(o.total_amount), 0) as total_spent,
            COALESCE(SUM(o.remaining_amount), 0) as total_pending,
            MAX(o.order_date) as last_order_date
        FROM customers c
        LEFT JOIN orders o ON c.customer_id = o.customer_id
        WHERE c.name LIKE ? OR c.phone LIKE ?
        GROUP BY c.customer_id, c.name, c.phone, c.address
        ORDER BY last_order_date DESC
    ";
    
    $searchTerm = "%$search%";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$searchTerm, $searchTerm]);
    
    echo json_encode($stmt->fetchAll());
}

function handleGetCustomerOrders() {
    global $pdo;
    $customerId = $_GET['customerId'] ?? '';
    
    $stmt = $pdo->prepare("
        SELECT o.*, c.name as customer_name 
        FROM orders o 
        JOIN customers c ON o.customer_id = c.customer_id 
        WHERE o.customer_id = ? 
        ORDER BY o.order_date DESC
    ");
    $stmt->execute([$customerId]);
    
    echo json_encode($stmt->fetchAll());
}

function handleGetOrderItems() {
    global $pdo;
    $orderId = $_GET['orderId'] ?? '';
    
    $stmt = $pdo->prepare("
        SELECT oi.*, mi.name as menu_item_name 
        FROM order_items oi 
        LEFT JOIN menu_items mi ON oi.item_id = mi.item_id 
        WHERE oi.order_id = ?
    ");
    $stmt->execute([$orderId]);
    
    echo json_encode($stmt->fetchAll());
}

function handleGetExpenses() {
    global $pdo;
    $stmt = $pdo->query("SELECT * FROM expenses ORDER BY expense_date DESC");
    echo json_encode($stmt->fetchAll());
}

function handleAddExpense() {
    global $pdo;
    $input = json_decode(file_get_contents('php://input'), true);
    
    $stmt = $pdo->prepare("
        INSERT INTO expenses (description, amount, category, expense_date) 
        VALUES (?, ?, ?, ?)
    ");
    $stmt->execute([
        $input['description'],
        $input['amount'],
        $input['category'],
        $input['expense_date']
    ]);
    
    echo json_encode(['success' => true]);
}

function handleGetPendingOrders() {
    global $pdo;
    $search = $_GET['search'] ?? '';
    
    $stmt = $pdo->prepare("
        SELECT o.*, c.name as customer_name 
        FROM orders o 
        JOIN customers c ON o.customer_id = c.customer_id 
        WHERE o.remaining_amount > 0 
        AND (o.order_id LIKE ? OR c.name LIKE ?) 
        ORDER BY o.order_date DESC
    ");
    $searchTerm = "%$search%";
    $stmt->execute([$searchTerm, $searchTerm]);
    
    echo json_encode($stmt->fetchAll());
}

function handleGetOrderPayments() {
    global $pdo;
    $orderId = $_GET['orderId'] ?? '';
    
    $stmt = $pdo->prepare("SELECT * FROM payments WHERE order_id = ? ORDER BY payment_date DESC");
    $stmt->execute([$orderId]);
    
    echo json_encode($stmt->fetchAll());
}

function handleAddPayment() {
    global $pdo;
    $input = json_decode(file_get_contents('php://input'), true);
    
    $pdo->beginTransaction();
    
    try {
        // Add payment
        $stmt = $pdo->prepare("
            INSERT INTO payments (order_id, amount, payment_date, notes) 
            VALUES (?, ?, NOW(), ?)
        ");
        $stmt->execute([
            $input['order_id'],
            $input['amount'],
            $input['notes']
        ]);
        
        // Update order remaining amount and status
        $stmt = $pdo->prepare("
            UPDATE orders 
            SET remaining_amount = remaining_amount - ?,
                advance_payment = advance_payment + ?,
                status = CASE 
                    WHEN remaining_amount - ? <= 0 THEN 'Fulfilled'
                    WHEN advance_payment + ? > 0 THEN 'Partially_Paid'
                    ELSE 'Pending'
                END
            WHERE order_id = ?
        ");
        $stmt->execute([
            $input['amount'],
            $input['amount'],
            $input['amount'],
            $input['amount'],
            $input['order_id']
        ]);
        
        // Get updated order
        $stmt = $pdo->prepare("
            SELECT o.*, c.name as customer_name 
            FROM orders o 
            JOIN customers c ON o.customer_id = c.customer_id 
            WHERE o.order_id = ?
        ");
        $stmt->execute([$input['order_id']]);
        $updatedOrder = $stmt->fetch();
        
        $pdo->commit();
        echo json_encode(['success' => true, 'updatedOrder' => $updatedOrder]);
        
    } catch (Exception $e) {
        $pdo->rollBack();
        throw $e;
    }
}

function handleGetSupplyParties() {
    global $pdo;
    
    $stmt = $pdo->query("
        SELECT 
            p.id,
            p.party_name,
            p.supply_date,
            p.total_amount,
            COALESCE(SUM(pp.amount_paid), 0) as amount_paid,
            (p.total_amount - COALESCE(SUM(pp.amount_paid), 0)) as pending_amount
        FROM parties p
        LEFT JOIN party_payments pp ON p.id = pp.party_id
        GROUP BY p.id, p.party_name, p.supply_date, p.total_amount
        ORDER BY p.supply_date DESC
    ");
    
    echo json_encode($stmt->fetchAll());
}

function handleGetPartyNames() {
    global $pdo;
    $stmt = $pdo->query("SELECT DISTINCT party_name FROM parties ORDER BY party_name");
    $names = array_column($stmt->fetchAll(), 'party_name');
    echo json_encode($names);
}

function handleAddSupplyBill() {
    global $pdo;
    $input = json_decode(file_get_contents('php://input'), true);
    
    $stmt = $pdo->prepare("
        INSERT INTO parties (party_name, supply_date, details, total_amount) 
        VALUES (?, ?, ?, ?)
    ");
    $stmt->execute([
        $input['party_name'],
        $input['supply_date'],
        $input['details'],
        $input['total_amount']
    ]);
    
    echo json_encode(['success' => true]);
}

function handleGetPartyLedger() {
    global $pdo;
    $partyName = $_GET['partyName'] ?? '';
    
    // Get supplies
    $stmt = $pdo->prepare("SELECT * FROM parties WHERE party_name = ? ORDER BY supply_date");
    $stmt->execute([$partyName]);
    $supplies = $stmt->fetchAll();
    
    // Get payments
    $stmt = $pdo->prepare("
        SELECT pp.* FROM party_payments pp 
        JOIN parties p ON pp.party_id = p.id 
        WHERE p.party_name = ? 
        ORDER BY pp.payment_date
    ");
    $stmt->execute([$partyName]);
    $payments = $stmt->fetchAll();
    
    echo json_encode(['supplies' => $supplies, 'payments' => $payments]);
}

function handleAddPartyTransaction() {
    global $pdo;
    $input = json_decode(file_get_contents('php://input'), true);
    
    if ($input['type'] === 'Payment') {
        $stmt = $pdo->prepare("
            INSERT INTO party_payments (party_id, payment_date, amount_paid, note) 
            VALUES (?, NOW(), ?, ?)
        ");
        $stmt->execute([
            $input['party_id'],
            $input['amount'],
            $input['note']
        ]);
    } else { // New Charge
        $stmt = $pdo->prepare("
            INSERT INTO parties (party_name, supply_date, details, total_amount) 
            VALUES (?, NOW(), ?, ?)
        ");
        $stmt->execute([
            $input['party_name'],
            $input['note'] ?: 'Additional charge',
            $input['amount']
        ]);
    }
    
    echo json_encode(['success' => true]);
}
?>
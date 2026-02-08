const Product = require('../models/Product');
const StockAlert = require('../models/StockAlert');
const DealerOrder = require('../models/DealerOrder');
const Dealer = require('../models/Dealer');

/**
 * Check stock level for a product and trigger alerts/orders if low.
 * @param {string} productId 
 */
const checkStockAndReorder = async (productId) => {
    try {
        const product = await Product.findById(productId);
        if (!product) return;

        // Determine effective minimum stock threshold
        const minStock = product.minimumStockThreshold || product.lowStockThreshold || 10;
        const reorderQty = product.reorderQuantity || 50;

        if (product.stock <= minStock) {
            console.log(`[StockMonitor] Low stock detected for ${product.name} (Current: ${product.stock}, Min: ${minStock})`);

            // 1. Create or Update Stock Alert
            let alert = await StockAlert.findOne({ product: productId, status: 'ACTIVE' });
            if (!alert) {
                alert = new StockAlert({
                    product: productId,
                    currentStock: product.stock,
                    minimumStock: minStock,
                    status: 'ACTIVE'
                });
                await alert.save();
            } else {
                // Update current stock in existing alert
                alert.currentStock = product.stock;
                await alert.save();
            }

            // 2. Check if there is already a pending or processing order to avoid duplicates
            const existingOrder = await DealerOrder.findOne({
                product: productId,
                status: { $in: ['PENDING_ADMIN_APPROVAL', 'APPROVED', 'PROCESSING', 'DISPATCHED'] }
            });

            if (!existingOrder) {
                // 3. Auto-create Dealer Order
                // Need to find a linked dealer. 
                // If product has a specific dealer, use that.
                // If not, find one providing this category (User Requirement)
                let targetDealerId = product.dealer;

                if (!targetDealerId && product.category) {
                    const dealer = await Dealer.findOne({
                        suppliedCategory: product.category,
                        status: 'active'
                    });
                    if (dealer) {
                        targetDealerId = dealer._id;
                        // Determine if we should link this dealer to the product for future?
                        // product.dealer = dealer._id; await product.save();
                    }
                }

                if (targetDealerId) {
                    // Create Stock Request for visibility in Admin Panel
                    const StockRequest = require('../models/StockRequest');
                    const stockRequest = new StockRequest({
                        product: productId,
                        currentStock: product.stock,
                        requestedQuantity: reorderQty,
                        status: 'APPROVED',
                        approvedQuantity: reorderQty
                    });
                    await stockRequest.save();

                    const newOrder = new DealerOrder({
                        dealer: targetDealerId,
                        product: productId,
                        quantity: reorderQty,
                        status: 'APPROVED', // User requested automatic ordering
                        notes: 'Auto-generated order triggered by low stock',
                        stockRequestId: stockRequest._id
                    });
                    await newOrder.save();

                    // Link DealerOrder back to StockRequest
                    stockRequest.dealerOrder = newOrder._id;
                    await stockRequest.save();

                    console.log(`[StockMonitor] Auto-created APPROVED order ${newOrder._id} for dealer ${targetDealerId}`);

                    // Link order to alert
                    alert.dealerOrder = newOrder._id;
                    await alert.save();

                    // If we found a new dealer via category, update product to link them
                    if (!product.dealer && targetDealerId) {
                        await Product.findByIdAndUpdate(productId, { dealer: targetDealerId });
                    }
                } else {
                    console.warn(`[StockMonitor] No dealer assigned or found for category '${product.category}' for product ${product.name}. Cannot auto-order.`);
                }
            } else {
                console.log(`[StockMonitor] Order already exists calling for ${product.name}`);
            }
        } else {
            // Stock is sufficient, resolve any active alerts
            const alert = await StockAlert.findOne({ product: productId, status: 'ACTIVE' });
            if (alert) {
                alert.status = 'RESOLVED';
                await alert.save();
            }
        }
    } catch (error) {
        console.error('[StockMonitor] Error checking stock:', error);
    }
};

module.exports = {
    checkStockAndReorder
};

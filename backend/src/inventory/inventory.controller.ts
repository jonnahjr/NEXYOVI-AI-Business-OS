import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';

@ApiTags('Inventory')
@ApiBearerAuth()
@Controller('inventory')
export class InventoryController {
  constructor(private inventoryService: InventoryService) {}

  @Get('stats/:companyId')
  @ApiOperation({ summary: 'Inventory dashboard stats' })
  getStats(@Param('companyId') companyId: string) {
    return this.inventoryService.getStats(companyId);
  }

  @Get('products/:companyId')
  @ApiOperation({ summary: 'Get all products' })
  getProducts(@Param('companyId') companyId: string) {
    return this.inventoryService.getProducts(companyId);
  }

  @Get('products/low-stock/:companyId')
  @ApiOperation({ summary: 'Get low stock alerts' })
  getLowStock(@Param('companyId') companyId: string) {
    return this.inventoryService.getLowStockProducts(companyId);
  }

  @Get('products/detail/:id')
  @ApiOperation({ summary: 'Get product detail' })
  getProduct(@Param('id') id: string) {
    return this.inventoryService.getProduct(id);
  }

  @Post('products/:companyId')
  @ApiOperation({ summary: 'Create product' })
  createProduct(@Param('companyId') companyId: string, @Body() body: any) {
    return this.inventoryService.createProduct(companyId, body);
  }

  @Put('products/:id')
  @ApiOperation({ summary: 'Update product' })
  updateProduct(@Param('id') id: string, @Body() body: any) {
    return this.inventoryService.updateProduct(id, body);
  }

  @Delete('products/:id')
  @ApiOperation({ summary: 'Soft-delete product' })
  deleteProduct(@Param('id') id: string) {
    return this.inventoryService.deleteProduct(id);
  }

  @Put('products/:id/stock')
  @ApiOperation({ summary: 'Manually adjust stock' })
  adjustStock(@Param('id') id: string, @Body() body: { quantity: number; type: 'ADD' | 'SUBTRACT' }) {
    return this.inventoryService.adjustStock(id, body.quantity, body.type);
  }

  @Get('purchases/:companyId')
  @ApiOperation({ summary: 'Get all purchase orders' })
  getPurchases(@Param('companyId') companyId: string) {
    return this.inventoryService.getPurchases(companyId);
  }

  @Post('purchases/:companyId')
  @ApiOperation({ summary: 'Create purchase order (auto-updates stock)' })
  createPurchase(@Param('companyId') companyId: string, @Body() body: any) {
    return this.inventoryService.createPurchase(companyId, body);
  }

  @Put('purchases/:id/status')
  @ApiOperation({ summary: 'Update purchase order status' })
  updatePurchaseStatus(@Param('id') id: string, @Body() body: { status: any }) {
    return this.inventoryService.updatePurchaseStatus(id, body.status);
  }
}

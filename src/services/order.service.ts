import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Order } from 'src/entities/order.entity';
import { Customer } from 'src/entities/customer.entity';
import { OrderItem } from 'src/entities/order_item.entity';
import { Status } from 'src/entities/status.entity';
import { Ward } from 'src/entities/ward.entity';
import { FormattedOrder, OrderDetailResponse } from 'src/type/formattedOrder';
import { ViewProduct } from 'src/entities/view_product.entity';
import {
  CartItem,
  FormattedOrderItem,
  OrderItemResponse,
} from 'src/type/formattedOrderItem';
import * as fs from 'fs';
import { ProductResponse } from 'src/type/product';
import { Product } from 'src/entities/product.entity';
import { Transport } from 'src/entities/transport.entity';
import { DeliveryInfo } from 'src/type/address';
import { MailerService } from '@nestjs-modules/mailer';
import { LoggedUser } from 'src/type/customer';
import { OrderStatus } from 'src/type/status';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,

    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,

    private readonly configService: ConfigService,

    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,

    @InjectRepository(Status)
    private readonly statusRepository: Repository<Status>,

    @InjectRepository(Ward)
    private readonly wardRepository: Repository<Ward>,

    @InjectRepository(ViewProduct)
    private readonly viewProductRepository: Repository<ViewProduct>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(Transport)
    private readonly transportRepository: Repository<Transport>,

    private readonly mailerService: MailerService,
  ) {}
  async getAllStatuses(): Promise<OrderStatus[]> {
    return await this.statusRepository.find();
  }

  async getFormattedOrders(email: string): Promise<FormattedOrder[]> {
    const baseUrl = this.configService.get<string>('IMAGE_BASE_URL');

    const customer = await this.customerRepository.findOne({
      where: { email },
    });
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    const orders = await this.orderRepository.find({
      where: { customer_id: customer.id },
      order: { id: 'DESC' },
    });

    const formattedOrders: FormattedOrder[] = [];

    for (const order of orders) {
      const orderItems = await this.orderItemRepository.find({
        where: { orderId: order.id },
        relations: ['product'],
      });

      const formattedItems: FormattedOrderItem[] = [];

      for (const item of orderItems) {
        delete item.order;
        const viewProduct = await this.viewProductRepository.findOneBy({
          id: item.productId,
        });

        if (!viewProduct) {
          throw new NotFoundException(
            `Product view not found for ID ${item.productId}`,
          );
        }

        const featured_image = viewProduct.featuredImage?.startsWith('http')
          ? viewProduct.featuredImage
          : baseUrl + viewProduct.featuredImage;

        formattedItems.push({
          product_id: item.productId,
          order_id: item.orderId,
          qty: item.qty,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          product: {
            id: viewProduct.id,
            name: viewProduct.name,
            featured_image, // 👈 snake_case here
            price: viewProduct.price,
            sale_price: viewProduct.sale_price,
          },
        });
      }

      const status = await this.statusRepository.findOne({
        where: { id: order.order_status_id },
      });

      const ward = await this.wardRepository.findOne({
        where: { id: order.shipping_ward_id },
        relations: ['province'],
      });
      formattedOrders.push({
        id: order.id,
        created_date: order.created_date.toLocaleString('vi-VN', {
          timeZone: 'Asia/Ho_Chi_Minh',
        }),
        order_status_id: order.order_status_id,
        staff_id: order.staff_id,
        customer_id: order.customer_id,
        shipping_fullname: order.shipping_fullname,
        shipping_mobile: order.shipping_mobile,
        payment_method: order.payment_method,
        shipping_ward_id: order.shipping_ward_id,
        shipping_housenumber_street: order.shipping_housenumber_street,
        shipping_fee: order.shipping_fee,
        delivered_date: order.delivered_date
          ? order.delivered_date.toLocaleString('vi-VN', {
              timeZone: 'Asia/Ho_Chi_Minh',
            })
          : null,
        order_items: formattedItems,
        status_description: status?.description || 'Chưa xác định',
        ward_name: ward?.name,
        province_name: ward?.province?.name,
      });
    }

    return formattedOrders;
  }

  async getOrderDetail(
    email: string,
    orderId: number,
  ): Promise<OrderDetailResponse> {
    const baseUrl = this.configService.get<string>('IMAGE_BASE_URL');

    const customer = await this.customerRepository.findOne({
      where: { email },
    });
    if (!customer) throw new NotFoundException('Customer not found');

    const order = await this.orderRepository.findOne({
      where: { id: orderId, customer_id: customer.id },
    });
    if (!order) throw new NotFoundException('Order not found');

    const orderItems = await this.orderItemRepository.find({
      where: { orderId: order.id },
    });

    const formattedItems: OrderItemResponse[] = [];
    let total_price = 0;

    for (const item of orderItems) {
      const viewProduct = await this.viewProductRepository.findOneBy({
        id: item.productId,
      });
      if (!viewProduct) continue;

      const featured_image = viewProduct.featuredImage.startsWith('http')
        ? viewProduct.featuredImage
        : baseUrl + viewProduct.featuredImage;

      const product: ProductResponse = {
        id: viewProduct.id,
        name: viewProduct.name,
        featured_image,
        price: viewProduct.price,
        sale_price: viewProduct.sale_price,
      };

      formattedItems.push({
        product_id: item.productId,
        order_id: item.orderId,
        qty: item.qty,
        unit_price: item.unitPrice,
        total_price: item.totalPrice,
        product,
      });

      total_price += item.totalPrice;
    }

    const status = await this.statusRepository.findOne({
      where: { id: order.order_status_id },
    });

    const ward = await this.wardRepository.findOne({
      where: { id: order.shipping_ward_id },
      relations: ['province'],
    });

    return {
      id: order.id,
      created_date: order.created_date.toLocaleString('vi-VN', {
        timeZone: 'Asia/Ho_Chi_Minh',
      }),
      order_status_id: order.order_status_id,
      staff_id: order.staff_id,
      customer_id: order.customer_id,
      shipping_fullname: order.shipping_fullname,
      shipping_mobile: order.shipping_mobile,
      payment_method: order.payment_method,
      shipping_ward_id: order.shipping_ward_id,
      shipping_housenumber_street: order.shipping_housenumber_street,
      shipping_fee: order.shipping_fee,
      delivered_date: order.delivered_date
        ? order.delivered_date.toLocaleString('vi-VN', {
            timeZone: 'Asia/Ho_Chi_Minh',
          })
        : null,
      order_items: formattedItems,
      status_description: status?.description || 'Chưa xác định',
      ward_name: ward?.name,
      province_name: ward?.province?.name,
      total_price,
    };
  }

  async cancelOrder(
    email: string,
    orderId: number,
  ): Promise<{ message: string }> {
    const customer = await this.customerRepository.findOne({
      where: { email },
    });
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    const order = await this.orderRepository.findOne({
      where: { id: orderId, customer_id: customer.id },
      relations: ['status', 'order_item'],
    });

    if (!order) {
      throw new ForbiddenException('Unauthorized or order not found');
    }

    const currentStatusId = order.order_status_id;

    // Update status to 6 (Cancelled)
    await this.orderRepository.update(orderId, { order_status_id: 6 });

    // If it was already packaged (status 3), restore inventory
    if (currentStatusId === 3) {
      for (const item of order.order_item) {
        await this.productRepository.increment(
          { id: item.productId },
          'inventory_qty',
          item.qty,
        );
      }
    }

    return { message: `✅ Đã huỷ đơn hàng #${orderId}` };
  }

  async checkout(
    cartItems: CartItem[],
    deliveryInfo: DeliveryInfo,
    loggedUser: LoggedUser,
  ) {
    if (!cartItems?.length) {
      throw new BadRequestException('Giỏ hàng trống.');
    }
    if (!loggedUser?.id) {
      throw new UnauthorizedException('Người dùng chưa đăng nhập.');
    }

    const transport = await this.transportRepository.findOne({
      where: {
        province: { id: deliveryInfo.province },
      },
      relations: ['province'],
    });

    if (!transport) {
      throw new BadRequestException('Không tìm thấy thông tin phí giao hàng.');
    }

    const shipping_fee = transport.price;

    const orderData: DeepPartial<Order> = {
      created_date: new Date().toISOString(),
      order_status_id: 1,
      staff_id: undefined,
      customer_id: loggedUser.id,
      shipping_fullname: deliveryInfo.fullname,
      shipping_mobile: deliveryInfo.mobile,
      payment_method: deliveryInfo.payment_method,
      shipping_ward_id: String(deliveryInfo.ward),
      shipping_housenumber_street: deliveryInfo.address,
      shipping_fee,
      delivered_date: new Date(
        Date.now() + 3 * 24 * 60 * 60 * 1000,
      ).toISOString(),
    };

    const order = await this.orderRepository.save(orderData);

    for (const item of cartItems) {
      const orderItem = this.orderItemRepository.create({
        productId: item.id,
        orderId: order.id,
        qty: item.qty,
        unitPrice: item.sale_price,
        totalPrice: item.qty * item.sale_price,
      });

      await this.orderItemRepository.save(orderItem);
    }

    // Fetch full address info
    const ward = await this.wardRepository.findOne({
      where: { id: String(deliveryInfo.ward) },
      relations: ['province'],
    });

    const fullAddress = `${deliveryInfo.address}, ${ward?.name || ''}, ${ward?.name || ''}, ${ward?.province?.name || ''}`;

    const paymentMethodMap: Record<number, string> = {
      0: 'Thanh toán khi nhận hàng (COD)',
      1: 'Chuyển khoản ngân hàng',
      2: 'Thanh toán qua ví điện tử',
      3: 'Thẻ tín dụng/Ghi nợ',
    };
    const paymentMethodText =
      paymentMethodMap[deliveryInfo.payment_method] || 'Không xác định';

    const productListHTML = cartItems
      .map((item) => {
        const imageName = item.featured_image?.split('/').pop();
        const imgBase64 = imageName ? this.getBase64Image(imageName) : '';
        return `
        <li style="margin-bottom: 15px;">
          <img src="${imgBase64}" alt="${item.name}" width="80" style="display:block; margin-bottom: 5px;" />
          ${item.name} - SL: ${item.qty} - Đơn giá: ${item.sale_price.toLocaleString()}đ - Thành tiền: ${(item.qty * item.sale_price).toLocaleString()}đ
        </li>
      `;
      })
      .join('');

    const web = process.env.FRONTEND_URL;

    const htmlContent = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>ĐƠN HÀNG MỚI</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      color: #333;
    }
    .card {
      max-width: 500px;
      margin: auto;
      border: 1px solid #ccc;
      padding: 20px;
    }
    h2 {
      color: #000;
    }
    ul {
      padding-left: 20px;
    }
    .total {
      font-weight: bold;
      margin-top: 10px;
    }
    .info {
      margin-top: 15px;
    }
  </style>
</head>
<body>
  <div class="card">
    <h2>🎉 Cảm ơn bạn đã đặt hàng tại Godashop!</h2>
    <p>Xin chào ${deliveryInfo.fullname},</p>
    <p>Chúng tôi đã nhận được đơn hàng của bạn:</p>
    <ul>
      ${productListHTML}
    </ul>
    <hr/>
    <p class="total">Phí giao hàng: ${shipping_fee.toLocaleString()}đ</p>
    <p class="info">
      <b>Địa chỉ giao hàng:</b><br>
      ${fullAddress}<br>
      <b>Hình thức thanh toán:</b> ${paymentMethodText}<br>
      <b>SĐT:</b> ${deliveryInfo.mobile}
    </p>
    <hr/>
    <p>Đơn hàng sẽ được xử lý trong vòng 3 ngày. Bạn có thể kiểm tra chi tiết đơn hàng của mình trên website: <a href="${web}">${web}</a></p>
    <p>Trân trọng,<br/>Đội ngũ Godashop</p>
  </div>
</body>
</html>
`;

    await this.mailerService.sendMail({
      to: loggedUser.email,
      subject: 'Godashop - Xác nhận đơn hàng',
      html: htmlContent,
    });

    return {
      message: 'Đơn hàng đã được tạo thành công.',
      order_id: order.id,
      loggedUser,
      deliveryInfo,
      cartItems,
    };
  }

  private getBase64Image(filename: string): string {
    const filePath = `public/uploads/${filename}`;
    if (!fs.existsSync(filePath)) return '';
    const imageData = fs.readFileSync(filePath);
    const ext = filename.split('.').pop();
    return `data:image/${ext};base64,${imageData.toString('base64')}`;
  }
}

const { Room, Booking, User } = require("../models/index");
const midtransClient = require("midtrans-client");

class paymentController {
  static async orders(req, res, next) {
    try {
      const orders = await Booking.findAll({
        include: [
          {
            model: User,
            attributes: {
              exclude: [
                "password",
                "user_id",
                "role",
                "createdAt",
                "updatedAt",
              ],
            },
          },
          {
            model: Room,
            attributes: {
              exclude: ["createdAt", "updatedAt"],
            },
          },
        ],
        where: {
          user_id: req.loginData.user_id,
        },
      });

      if (!orders) throw { name: "NOT_FOUND" };

      res.status(200).json(orders);
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  static async midtransCreateTransaction(req, res, next) {
    try {
      const { order_id } = req.params;
      const order = await Booking.findByPk(order_id);
      if (!order) throw { name: "NOT_FOUND" };

      // Create Snap API instance
      const totalPayment = order.total_price;
      let snap = new midtransClient.Snap({
        isProduction: false,
        serverKey: "SB-Mid-server-kVatzLn6V6GC1tp4iNjiYFfT",
      });

      let parameter = {
        transaction_details: {
          order_id: order_id,
          gross_amount: totalPayment,
        },
        credit_card: {
          secure: true,
        },
        customer_details: {
          email: req.loginData.email,
        },
      };

      const { token } = await snap.createTransaction(parameter);
      res.status(200).json({
        transaction_token: token,
        order_id,
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  //   static async updateOrderStatus(req, res, next) {
  //     try {
  //       const { order_id } = req.params;
  //       const order = await Booking.findByPk(order_id);
  //       if (!order) throw { name: "NOT_FOUND" };
  //       const room_id = order.room_id;
  //       const room = await Room.findByPk(room_id);

  //       const base64Key = Buffer.from(
  //         "SB-Mid-server-kVatzLn6V6GC1tp4iNjiYFfT"
  //       ).toString("base64");
  //       const { data } = await axios.get(
  //         `https://api.sandbox.midtrans.com/v2/${order_id}/status`,
  //         {
  //           headers: {
  //             Authorization: `Basic ${base64Key}`,
  //           },
  //         }
  //       );

  //       if (+data.status_code !== 200) {
  //         throw { name: "BAD_REQUEST" };
  //       }

  //       if (data.transaction_status !== "capture") {
  //         throw { name: "BAD_REQUEST" };
  //       }

  //       await order.update({ booking_status: "completed" });
  //       await room.update({ availability: false });

  //       res.status(200).json({
  //         message: "Payment success!",
  //       });
  //     } catch (error) {
  //       console.log(error);
  //       next(error);
  //     }
  //   }
}

module.exports = paymentController;

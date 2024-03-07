import { scheduleJob } from "node-schedule";
import Coupon from "../../DB/Models/coupon.model.js";
import { DateTime } from "luxon";

export function cronToChangeExpiredCoupons() {
  // console.log("Cron job started");

  scheduleJob("*/5 * * * * *", async () => {
    // console.log("Cron job started");

    const coupons = await Coupon.find({ couponStatus: "valid" });
    for (const coupon of coupons) {
      if (DateTime.fromISO(coupon.toDate) < DateTime.now()) {
        coupon.couponStatus = "expired";
        await coupon.save();
      }
      console.log("ggggg");
    }
  });
}

// Utils/printReceipt.js
import EbPrinter, { FontSize, AlignmentType } from 'react-native-ebprinter';

// selectUsbPrinter has no native Promise — it returns immediately without
// waiting for the actual USB handshake to finish. This small pause gives
// the connection a moment to settle before we draw/print on it.
const USB_CONNECT_SETTLE_MS = 350;
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const BUSINESS_HEADER = {
  name: 'B&M Private Pty Ltd',
  addressLine1: '7/328 Newman Road,',
  addressLine2: 'Geebung QLD 4034',
  phone: 'PH 07 3216 2686',
  abn: 'ABN 40 603 844 426',
};

// Same order-type codes used across the app (OrderSuccess.js etc).
const ORDER_TYPE_TEXT = {
  1: 'Delivery',
  2: 'Pickup',
  3: 'Dine In',
  4: 'Catering',
};

function buildOrderPayload(response) {
  return {
    strbname:
      response.sourcetype === 'Uber'
        ? 'Indus Indian & Nepalese Restaurant'
        : 'T/A Indus Indian & Nepalese Restaurant',
    order_number_date: `#${response.id}   ${response.date}`,
    orderTypeText: ORDER_TYPE_TEXT[response.order_type] || null,
    buyername: `${response.buyerdata?.name ?? response.buyername ?? ''} ${response.buyerdata?.last_name ?? ''}`.trim(),
    buyeremail: response.buyerdata?.email || response.buyeremail || '',
    buyercel: (response.buyerdata?.cel || response.buyerphone || '').replace(/[^a-zA-Z0-9]/g, ''),
    dishdata: response.dishdata || [],
    discount: String(response.discount ?? '0'),
    tax: String(response.tax_price ?? '0'),
    servicefee_price: String(response.servicefee_price ?? '0'),
    total: String(response.total ?? '0'),
  };
}

// ---- Full receipt (USB / counter copy) ------------------------------
function drawReceipt(deviceIndex, order) {
  const draw = (text, size = FontSize.Big, align = AlignmentType.Center) =>
    EbPrinter.drawCustom(deviceIndex, String(text), size, align);
  const nl = (n = 1) => {
    for (let i = 0; i < n; i++) EbPrinter.drawNewLine(deviceIndex);
  };

  draw(BUSINESS_HEADER.name); nl();
  draw(order.strbname); nl();
  draw(BUSINESS_HEADER.addressLine1); nl();
  draw(BUSINESS_HEADER.addressLine2); nl();
  draw(BUSINESS_HEADER.phone); nl();
  draw(BUSINESS_HEADER.abn); nl(3);

  draw(order.order_number_date, FontSize.Medium); nl(3);

  EbPrinter.drawOneLine(deviceIndex, FontSize.MediumBold);
  nl();
  draw(order.buyername); nl();
  if (order.buyeremail) { draw(order.buyeremail); nl(); }
  if (order.buyercel) { draw(order.buyercel); nl(); }

  EbPrinter.drawOneLine(deviceIndex, FontSize.MediumBold);

  const printLine = dish => {
    nl();
    EbPrinter.drawLeftRight(
      deviceIndex,
      `${dish.quantity} X ${dish.name}`,
      FontSize.MediumBold,
      String(dish.total),
      FontSize.MediumBold,
    );
    if (dish.sets?.length > 0) {
      dish.sets.forEach(set =>
        EbPrinter.drawCustom(
          deviceIndex,
          `${set.name} - ${set.choiceText}`,
          FontSize.Default,
          AlignmentType.Left,
        ),
      );
    }
    nl();
    if (dish.free && Object.keys(dish.free).length !== 0) {
      dish.free.data.forEach(printLine);
    }
  };

  order.dishdata.forEach(group => group.data.forEach(printLine));

  EbPrinter.drawOneLine(deviceIndex, FontSize.MediumBold);
  EbPrinter.drawLeftRight(deviceIndex, 'Discount :', FontSize.MediumBold, order.discount, FontSize.MediumBold);
  EbPrinter.drawLeftRight(deviceIndex, 'Tax :', FontSize.MediumBold, order.tax, FontSize.MediumBold);
  EbPrinter.drawLeftRight(deviceIndex, 'Service Fee :', FontSize.MediumBold, order.servicefee_price, FontSize.MediumBold);
  EbPrinter.drawLeftRight(deviceIndex, 'TOTAL :', FontSize.Big, order.total, FontSize.Big);
  nl();
  EbPrinter.drawOneLine(deviceIndex, FontSize.MediumBold);
  nl(4);

  draw('THANK YOU FOR VISITING'); nl();
  draw('OPEN 7 DAYS'); nl(4);

  EbPrinter.printText(deviceIndex, true);
}

// ---- Kitchen ticket (WiFi copy) --------------------------------------
// Deliberately stripped down: order number + date/time, order type,
// items (large + bold, no per-line price — kitchen staff don't need it),
// and the price summary. No business header, no customer contact info.
function drawKitchenReceipt(deviceIndex, order) {
  const draw = (text, size = FontSize.Big, align = AlignmentType.Center) =>
    EbPrinter.drawCustom(deviceIndex, String(text), size, align);
  const nl = (n = 1) => {
    for (let i = 0; i < n; i++) EbPrinter.drawNewLine(deviceIndex);
  };

  draw(order.order_number_date, FontSize.Big); nl();
  if (order.orderTypeText) {
    draw(order.orderTypeText.toUpperCase(), FontSize.MediumBold);
    nl(2);
  } else {
    nl();
  }

  EbPrinter.drawOneLine(deviceIndex, FontSize.MediumBold);

  // Items — large and bold, per the kitchen-ticket spec. FontSize.Big is
  // the largest size this printer module exposes; if your build of
  // react-native-ebprinter has a distinct "BigBold" enum value, swap it
  // in below for a heavier weight at the same size.
  const printKitchenLine = dish => {
    nl();
    draw(`${dish.quantity} X ${dish.name}`, FontSize.Big, AlignmentType.Left);
    if (dish.sets?.length > 0) {
      dish.sets.forEach(set =>
        EbPrinter.drawCustom(
          deviceIndex,
          `  ${set.name} - ${set.choiceText}`,
          FontSize.MediumBold,
          AlignmentType.Left,
        ),
      );
    }
    if (dish.notes) {
      EbPrinter.drawCustom(deviceIndex, `  Note: ${dish.notes}`, FontSize.MediumBold, AlignmentType.Left);
    }
    if (dish.free && Object.keys(dish.free).length !== 0) {
      dish.free.data.forEach(printKitchenLine);
    }
  };

  order.dishdata.forEach(group => group.data.forEach(printKitchenLine));
  nl();

  EbPrinter.drawOneLine(deviceIndex, FontSize.MediumBold);
  EbPrinter.drawLeftRight(deviceIndex, 'Discount :', FontSize.MediumBold, order.discount, FontSize.MediumBold);
  EbPrinter.drawLeftRight(deviceIndex, 'Tax :', FontSize.MediumBold, order.tax, FontSize.MediumBold);
  EbPrinter.drawLeftRight(deviceIndex, 'Service Fee :', FontSize.MediumBold, order.servicefee_price, FontSize.MediumBold);
  EbPrinter.drawLeftRight(deviceIndex, 'TOTAL :', FontSize.Big, order.total, FontSize.Big);
  nl(4);

  EbPrinter.printText(deviceIndex, true);
}

/**
 * Prints receipts straight from an already-loaded order object (no API
 * call). USB gets the full customer receipt; WiFi (if configured) gets
 * the stripped-down kitchen ticket. Each device prints independently —
 * a failure or missing config on one doesn't block the other.
 *
 * @param {object} params
 * @param {object} params.response - raw order object
 * @param {any} params.usbPrinter - paired USB device address/handle
 * @param {{ip: string, port?: number}} [params.wifiPrinter] - kitchen printer, omit/leave ip null to skip
 * @returns {Promise<{usb: boolean, wifi: boolean}>} which copies actually printed
 */
export async function printOrderReceipt({ response, usbPrinter, wifiPrinter }) {
  if (!response || !Array.isArray(response.dishdata) || response.dishdata.length === 0) {
    return { usb: false, wifi: false };
  }
  const order = buildOrderPayload(response);
  const result = { usb: false, wifi: false };

  if (usbPrinter != null) {
    try {
      await EbPrinter.selectUsbPrinter(0, usbPrinter);
      await delay(USB_CONNECT_SETTLE_MS);
      drawReceipt(0, order);
      result.usb = true;
    } catch (e) {
      console.log('USB print error:', e);
    }
  }

  if (wifiPrinter?.ip) {
    try {
      const connected = await EbPrinter.selectNetworkPrinter(
        1,
        wifiPrinter.ip,
        wifiPrinter.port || 9100,
      );
      if (connected) {
        drawKitchenReceipt(1, order);
        result.wifi = true;
      } else {
        console.log('Could not reach WiFi printer at', wifiPrinter.ip);
      }
    } catch (e) {
      console.log('WiFi print error:', e);
    }
  }

  return result;
}
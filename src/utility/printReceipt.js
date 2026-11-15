// Utils/printReceipt.js
import EbPrinter, { FontSize, AlignmentType } from 'react-native-ebprinter';

const USB_CONNECT_SETTLE_MS = 2500;
let usbSelected = null; // which USB device is currently selected on index 0
const SECTION_GAP_MS = 300;
const PRINT_GAP_MS = 2000;
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// USB customer receipt sizes (decreased). Tune these two values if needed:
//   RECEIPT_BOLD: FontSize.SmallBold (smaller) / FontSize.MediumBold (larger)
//   RECEIPT_TEXT: FontSize.Default   (smaller) / FontSize.Medium     (larger)
const RECEIPT_BOLD = FontSize.SmallBold;
const RECEIPT_TEXT = FontSize.Default;

const VALID_FONTS = new Set(Object.values(FontSize).filter(v => typeof v === 'number'));
const VALID_ALIGNS = new Set(Object.values(AlignmentType).filter(v => typeof v === 'number'));

const short = (s, n = 40) => {
  const t = String(s);
  return t.length > n ? `${t.slice(0, n)}...` : t;
};

// Records every draw call, validates ALL of them in JS, then sends them to the
// native printer. A bad value becomes a thrown error instead of a native crash.
function createCanvas() {
  const ops = [];
  let section = '';
  const add = (name, args) => ops.push({ name, args, section });

  const describe = op => {
    const a = op.args;
    const text =
      op.name === 'drawLeftRight'
        ? `${short(a[1], 20)} | ${short(a[3], 20)}`
        : op.name === 'drawCustom'
          ? short(a[1])
          : '';
    return `[${op.section || '-'}] ${op.name}(${text ? `"${text}"` : ''})`;
  };

  const validate = () => {
    const problems = [];
    const badFont = (op, f, which) => {
      if (!VALID_FONTS.has(f)) problems.push(`${describe(op)} -> ${which} font is ${String(f)}`);
    };
    const badText = (op, v, which) => {
      if (typeof v !== 'string') problems.push(`${describe(op)} -> ${which} text must be a string`);
    };
    ops.forEach(op => {
      if (op.gap) return;
      const a = op.args;
      if (!Number.isInteger(a[0])) problems.push(`${describe(op)} -> deviceIndex is ${String(a[0])}`);
      switch (op.name) {
        case 'drawCustom':
          badText(op, a[1], 'left');
          badFont(op, a[2], 'font');
          if (!VALID_ALIGNS.has(a[3])) problems.push(`${describe(op)} -> invalid alignment`);
          break;
        case 'drawLeftRight':
          badText(op, a[1], 'left');
          badFont(op, a[2], 'left');
          badText(op, a[3], 'right');
          badFont(op, a[4], 'right');
          break;
        case 'drawOneLine':
          badFont(op, a[1], 'line');
          break;
        case 'printText':
          if (typeof a[1] !== 'boolean') problems.push(`${describe(op)} -> isAutoFeed is ${String(a[1])}`);
          break;
        default:
          break;
      }
    });
    return problems;
  };

  return {
    section(name) { section = name; },
    gap() { ops.push({ gap: true, section }); },
    drawCustom: (...a) => add('drawCustom', a),
    drawLeftRight: (...a) => add('drawLeftRight', a),
    drawNewLine: (...a) => add('drawNewLine', a),
    drawOneLine: (...a) => add('drawOneLine', a),
    printText: (...a) => add('printText', a),

    async run() {
      const problems = validate();
      if (problems.length) {
        throw new Error(
          `Nothing was sent to the printer. ${problems.length} invalid value(s):\n- ${problems.slice(0, 6).join('\n- ')}`,
        );
      }
      for (let i = 0; i < ops.length; i++) {
        const op = ops[i];
        if (op.gap) {
          await delay(SECTION_GAP_MS); // let the native queue drain first
          continue;
        }
        try {
          EbPrinter[op.name](...op.args);
        } catch (e) {
          throw new Error(`${describe(op)} failed: ${(e && e.message) || e}`);
        }
      }
    },
  };
}

/* ------------------------------------------------------------------ */

const BUSINESS_HEADER = {
  name: 'B&M Private Pty Ltd',
  addressLine1: '7/328 Newman Road,',
  addressLine2: 'Geebung QLD 4034',
  phone: 'PH 07 3216 2686',
  abn: 'ABN 40 603 844 426',
};

const ORDER_TYPE_TEXT = {
  1: 'Delivery',
  2: 'Pickup',
  3: 'Dine In',
  4: 'Catering',
};

// Order detail screens receive some fields as JSON strings; accept both.
const safeParse = v => {
  if (typeof v !== 'string') return v;
  try {
    return JSON.parse(v);
  } catch (e) {
    return undefined;
  }
};

function buildOrderPayload(raw) {
  const response = {
    ...raw,
    buyerdata: safeParse(raw.buyerdata),
    cartfee: safeParse(raw.cartfee),
    paymentmethod: safeParse(raw.paymentmethod),
  };

  const paymentMethod =
    Array.isArray(response.paymentmethod) && response.paymentmethod.length > 0
      ? response.paymentmethod[0]?.payment_method || response.paymentmethod[0]?.name || '-'
      : response.payment_method || '-';

  return {
    strbname:
      response.sourcetype === 'Uber'
        ? 'Indus Indian & Nepalese Restaurant'
        : 'T/A Indus Indian & Nepalese Restaurant',
    order_number_date: `#${response.id}   ${response.date}`,
    orderTypeText: ORDER_TYPE_TEXT[response.order_type] || null,
    buyername: `${response.buyerdata?.name ?? response.buyername ?? ''} ${response.buyerdata?.last_name ?? ''}`.trim(),
    buyeremail: response.buyerdata?.email || response.buyeremail || '',
    buyercel: (response.buyerdata?.cel || response.buyerphone || '').replace(/[^a-zA-Z0-9+ ]/g, ''),
    buyeraddress: response.buyerdata?.delievryaddress || response.deliveryaddress || '',
    paymentMethod: String(paymentMethod ?? '-'),
    dishdata: response.dishdata || [],
    discount: String(response.cartfee?.discount ?? response.discount ?? '0'),
    tax: String(response.cartfee?.taxprice ?? response.tax_price ?? '0'),
    servicefee_price: String(response.cartfee?.servicefeeprice ?? response.servicefee_price ?? '0'),
    deliverycost: String(response.cartfee?.deliverycost ?? response.deliverycost ?? '0'),
    total: String(response.cartfee?.total ?? response.total ?? '0'),
  };
}

function formatChoiceText(set) {
  if (set.choiceText) return set.choiceText;
  if (Array.isArray(set.choice) && set.choice.length > 0) {
    return set.choice.map(c => `${c.qty || 1}x ${c.name}`).join(', ');
  }
  return '';
}

// ---------------- USB customer receipt (smaller fonts) ----------------
async function drawReceipt(deviceIndex, order) {
  const E = createCanvas();
  const draw = (text, size = RECEIPT_TEXT, align = AlignmentType.Center) =>
    E.drawCustom(deviceIndex, String(text), size, align);
  const nl = (n = 1) => {
    for (let i = 0; i < n; i++) E.drawNewLine(deviceIndex);
  };

  // A: header
  E.section('A header');
  draw(BUSINESS_HEADER.name, RECEIPT_BOLD); nl();
  draw(order.strbname, RECEIPT_BOLD); nl();
  draw(BUSINESS_HEADER.addressLine1, RECEIPT_TEXT); nl();
  draw(BUSINESS_HEADER.addressLine2, RECEIPT_TEXT); nl();
  draw(BUSINESS_HEADER.phone, RECEIPT_TEXT); nl();
  draw(BUSINESS_HEADER.abn, RECEIPT_TEXT); nl(2);

  draw(order.order_number_date, RECEIPT_BOLD); nl();
  if (order.orderTypeText) {
    draw(`[ ${order.orderTypeText.toUpperCase()} ]`, RECEIPT_BOLD); nl();
  }
  nl();
  E.gap();

  // B: customer block
  E.section('B customer');
  E.drawOneLine(deviceIndex, RECEIPT_TEXT);
  nl();
  if (order.buyername) { draw(`Customer: ${order.buyername}`, RECEIPT_BOLD, AlignmentType.Left); nl(); }
  if (order.buyercel) { draw(`Phone: ${order.buyercel}`, RECEIPT_TEXT, AlignmentType.Left); nl(); }
  if (order.buyeremail) { draw(`Email: ${order.buyeremail}`, RECEIPT_TEXT, AlignmentType.Left); nl(); }
  if (order.buyeraddress) { draw(`Address: ${order.buyeraddress}`, RECEIPT_TEXT, AlignmentType.Left); nl(); }

  E.drawOneLine(deviceIndex, RECEIPT_TEXT);
  E.gap();

  // C: items
  E.section('C items');
  const printLine = dish => {
    nl();
    E.drawLeftRight(
      deviceIndex,
      `${dish.quantity} X ${dish.name}`,
      RECEIPT_BOLD,
      String(parseFloat(dish.total || 0).toFixed(2)),
      RECEIPT_BOLD,
    );

    const offerTag =
      dish.offerBadge ||
      (dish.isFreeReward ? 'GET 1 FREE' : dish.isDealDish ? 'BUY 1 DEAL' : null);
    if (offerTag) {
      E.drawCustom(deviceIndex, `  * ${String(offerTag).toUpperCase()} *`, FontSize.Small, AlignmentType.Left);
    }

    if (dish.sets?.length > 0) {
      dish.sets.forEach(set => {
        const choiceText = formatChoiceText(set);
        if (choiceText) {
          E.drawCustom(
            deviceIndex,
            `  ${set.name || 'Option'}: ${choiceText}`,
            FontSize.Small,
            AlignmentType.Left,
          );
        }
      });
    }

    if (dish.notes) {
      E.drawCustom(deviceIndex, `  Note: ${dish.notes}`, FontSize.Small, AlignmentType.Left);
    }

    if (dish.free && Object.keys(dish.free).length !== 0 && Array.isArray(dish.free.data)) {
      dish.free.data.forEach(printLine);
    }
  };

  order.dishdata.forEach(group => (group.data || []).forEach(printLine));
  nl();
  E.gap();

  // D: totals
  E.section('D totals');
  E.drawOneLine(deviceIndex, RECEIPT_TEXT);
  if (parseFloat(order.discount) > 0) {
    E.drawLeftRight(deviceIndex, 'Discount :', RECEIPT_TEXT, `-${parseFloat(order.discount).toFixed(2)}`, RECEIPT_TEXT);
  }
  if (parseFloat(order.deliverycost) > 0) {
    E.drawLeftRight(deviceIndex, 'Delivery Fee :', RECEIPT_TEXT, parseFloat(order.deliverycost).toFixed(2), RECEIPT_TEXT);
  }
  if (parseFloat(order.tax) > 0) {
    E.drawLeftRight(deviceIndex, 'Tax :', RECEIPT_TEXT, parseFloat(order.tax).toFixed(2), RECEIPT_TEXT);
  }
  if (parseFloat(order.servicefee_price) > 0) {
    E.drawLeftRight(deviceIndex, 'Service Fee :', RECEIPT_TEXT, parseFloat(order.servicefee_price).toFixed(2), RECEIPT_TEXT);
  }

  E.drawLeftRight(deviceIndex, 'TOTAL :', RECEIPT_BOLD, parseFloat(order.total).toFixed(2), RECEIPT_BOLD);
  E.drawLeftRight(deviceIndex, 'Payment Method :', RECEIPT_BOLD, order.paymentMethod, RECEIPT_BOLD);
  nl();
  E.drawOneLine(deviceIndex, RECEIPT_TEXT);
  nl(2);
  E.gap();

  // E: footer, then print
  E.section('E footer + printText');
  draw('THANK YOU FOR VISITING', RECEIPT_TEXT); nl();
  draw('OPEN 7 DAYS', RECEIPT_TEXT); nl(4);

  E.printText(deviceIndex, true);

  await E.run();
}

// ---------------- WiFi kitchen ticket (unchanged sizes) ----------------
async function drawKitchenReceipt(deviceIndex, order) {
  const E = createCanvas();
  const draw = (text, size = FontSize.Big, align = AlignmentType.Center) =>
    E.drawCustom(deviceIndex, String(text), size, align);
  const nl = (n = 1) => {
    for (let i = 0; i < n; i++) E.drawNewLine(deviceIndex);
  };

  E.section('kitchen header');
  draw(order.order_number_date, FontSize.Big); nl();
  if (order.orderTypeText) {
    draw(`[ ${order.orderTypeText.toUpperCase()} ]`, FontSize.Big);
    nl(2);
  } else {
    nl();
  }

  E.drawOneLine(deviceIndex, FontSize.MediumBold);
  nl();

  E.section('kitchen customer');
  if (order.buyername) {
    draw(`Customer: ${order.buyername}`, FontSize.MediumBold, AlignmentType.Left); nl();
  }
  if (order.buyercel) {
    draw(`Phone: ${order.buyercel}`, FontSize.Medium, AlignmentType.Left); nl();
  }
  if (order.buyeraddress) {
    draw(`Address: ${order.buyeraddress}`, FontSize.Medium, AlignmentType.Left); nl();
  }
  nl();

  E.drawOneLine(deviceIndex, FontSize.MediumBold);

  E.section('kitchen items');
  const printKitchenLine = dish => {
    nl();
    draw(`${dish.quantity} X ${dish.name}`, FontSize.Big, AlignmentType.Left);

    const offerTag =
      dish.offerBadge ||
      (dish.isFreeReward ? 'GET 1 FREE' : dish.isDealDish ? 'BUY 1 DEAL' : null);
    if (offerTag) {
      E.drawCustom(deviceIndex, `  ** ${String(offerTag).toUpperCase()} **`, FontSize.MediumBold, AlignmentType.Left);
    }

    if (dish.sets?.length > 0) {
      dish.sets.forEach(set => {
        const choiceText = formatChoiceText(set);
        if (choiceText) {
          E.drawCustom(
            deviceIndex,
            `  ${set.name || 'Option'}: ${choiceText}`,
            FontSize.MediumBold,
            AlignmentType.Left,
          );
        }
      });
    }
    if (dish.notes) {
      E.drawCustom(deviceIndex, `  Note: ${dish.notes}`, FontSize.MediumBold, AlignmentType.Left);
    }
    if (dish.free && Object.keys(dish.free).length !== 0 && Array.isArray(dish.free.data)) {
      dish.free.data.forEach(printKitchenLine);
    }
  };

  order.dishdata.forEach(group => (group.data || []).forEach(printKitchenLine));
  nl();

  E.section('kitchen totals + printText');
  E.drawOneLine(deviceIndex, FontSize.MediumBold);
  E.drawLeftRight(deviceIndex, 'Payment :', FontSize.MediumBold, order.paymentMethod, FontSize.MediumBold);
  E.drawLeftRight(deviceIndex, 'TOTAL :', FontSize.Big, parseFloat(order.total).toFixed(2), FontSize.Big);
  nl(4);

  E.printText(deviceIndex, true);

  await E.run();
}

export async function printOrderReceipt({ response, usbPrinter, wifiPrinter, wifiPrinter2 }) {
  if (!response || !Array.isArray(response.dishdata) || response.dishdata.length === 0) {
    return { usb: false, wifi: false, wifi2: false, errors: ['Order has no items to print.'] };
  }
  const order = buildOrderPayload(response);
  const result = { usb: false, wifi: false, wifi2: false, errors: [] };
  const errMsg = e => (e && (e.message || e.code)) || String(e);

  // 1) + 2) Kitchen WiFi printers (device index 1 and 2)
  const printWifi = async (index, label, printer, resultKey) => {
    if (!printer?.ip) return;
    let stage = 'connecting';
    try {
      const connected = await EbPrinter.selectNetworkPrinter(index, printer.ip, printer.port || 9100);
      if (connected) {
        stage = 'sending ticket';
        await drawKitchenReceipt(index, order);
        result[resultKey] = true;
      } else {
        result.errors.push(`${label} (${printer.ip}): could not connect. Check the printer is on and on the same WiFi.`);
      }
    } catch (e) {
      console.log(`${label} print error:`, e);
      result.errors.push(`${label} (${printer.ip}) failed while ${stage}:\n${errMsg(e)}`);
    }
    await delay(PRINT_GAP_MS);
  };

  await printWifi(1, 'Kitchen Printer 1', wifiPrinter, 'wifi');
  await printWifi(2, 'Kitchen Printer 2', wifiPrinter2, 'wifi2');

  // 3) USB printer LAST (device index 0), so a USB problem can never lose kitchen tickets
  if (usbPrinter != null) {
    let stage = 'listing USB devices';
    try {
      const list = await EbPrinter.getUsbDeviceList(0);
      if (!Array.isArray(list) || !list.includes(usbPrinter)) {
        usbSelected = null; // unplugged/replugged: re-select next time
        console.log('USB printer not currently connected, skipping. Found:', list);
        result.errors.push(
          `USB printer: not found.\nSaved: ${usbPrinter}\nConnected now: ${
            Array.isArray(list) && list.length ? list.join(' | ') : 'none'
          }\nCheck the USB cable, or re-select the printer in Settings.`,
        );
      } else {
        if (!usbSelected || usbSelected !== usbPrinter) {
          stage = 'connecting to USB printer';
          EbPrinter.selectUsbPrinter(0, usbPrinter);
          usbSelected = usbPrinter;
          await delay(USB_CONNECT_SETTLE_MS);
        } else {
          await delay(300);
        }
        stage = 'sending receipt to USB printer';
        await drawReceipt(0, order);
        result.usb = true;
        await delay(PRINT_GAP_MS);
      }
    } catch (e) {
      usbSelected = null; // force a clean re-select next time
      console.log('USB print error:', e);
      result.errors.push(`USB printer failed while ${stage}:\n${errMsg(e)}`);
    }
  }

  return result;
}
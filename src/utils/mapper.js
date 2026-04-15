function toArray(maybeArray) {
  if (!maybeArray) return [];
  return Array.isArray(maybeArray) ? maybeArray : [maybeArray];
}

// ─────────────────────────────────────────
// LEDGER HELPERS
// ─────────────────────────────────────────
function extractLedgers(tallyJson) {
  console.log('=== CHECKING DATA STRUCTURE ===');

  const tallyMessages = tallyJson?.ENVELOPE?.BODY?.IMPORTDATA?.REQUESTDATA?.TALLYMESSAGE || [];
  console.log('Found TALLYMESSAGE items:', toArray(tallyMessages).length);

  const ledgers = toArray(tallyMessages)
    .filter(item => item && item.LEDGER)
    .map(item => item.LEDGER);

  console.log('Found LEDGER objects:', ledgers.length);

  // Old paths for compatibility
  const data = tallyJson?.ENVELOPE?.BODY?.DATA || {};
  const collection = data?.COLLECTION || {};
  const oldTallyMessage = data?.TALLYMESSAGE || {};

  const oldCandidates = [
    collection?.LEDGER,
    collection?.LEDGERLIST,
    collection?.LEDGERLIST?.LEDGER,
    data?.LEDGER,
    data?.LEDGERLIST,
    data?.LEDGERLIST?.LEDGER,
    oldTallyMessage?.LEDGER,
    oldTallyMessage?.LEDGERLIST,
    oldTallyMessage?.LEDGERLIST?.LEDGER,
  ];

  const oldLedgers = oldCandidates.flatMap((c) => toArray(c));
  const allLedgers = [...ledgers, ...oldLedgers];
  console.log('Total ledgers found:', allLedgers.length);
  console.log('=================================');

  return allLedgers;
}

function getSalesmanName(ledger) {
  const direct = ledger?.SALESMANNAME || ledger?.SALESMAN || ledger?.LEDGERSALESMAN || '';
  if (direct) return direct;

  const list = toArray(
    ledger?.['SALESMANLIST.LIST']?.SALESMAN ||
    ledger?.['SALESMANLIST.LIST']?.SALESMANNAME
  );
  if (list.filter(Boolean).length > 0) return list.filter(Boolean).join(', ');

  // Extract from PARENT group name e.g. "DEB : RAJESH" → "RAJESH"
  const parent = ledger?.PARENT || '';
  if (parent.toUpperCase().startsWith('DEB :')) {
    return parent.split(':')[1]?.trim() || '';
  }

  return '';
}

function extractCustomerName(ledger) {
  const oldMailingName = ledger?.['OLDMAILINGNAME.LIST']?.OLDMAILINGNAME;
  if (oldMailingName && oldMailingName.trim()) return oldMailingName.trim();

  const langNameList = ledger?.['LANGUAGENAME.LIST']?.['NAME.LIST']?.NAME;
  if (langNameList) {
    return Array.isArray(langNameList) ? langNameList[0] : langNameList;
  }

  const mailingDetails = ledger?.['LEDMAILINGDETAILS.LIST']?.MAILINGNAME;
  if (mailingDetails && mailingDetails.trim()) return mailingDetails.trim();

  return '';
}

function extractAddress(ledger) {
  const oldAddress = ledger?.['OLDADDRESS.LIST']?.OLDADDRESS;
  if (oldAddress) {
    if (Array.isArray(oldAddress)) {
      return oldAddress.filter(Boolean).join(', ');
    }
    if (typeof oldAddress === 'string' && oldAddress.trim()) {
      return oldAddress.trim();
    }
  }

  const ledAddress = ledger?.['LEDADDRESS.LIST'];
  if (ledAddress && typeof ledAddress === 'object') {
    const addresses = toArray(ledAddress);
    const joined = addresses.map(addr => addr?.ADDRESS || '').filter(Boolean).join(', ');
    if (joined) return joined;
  }

  return '';
}

function extractPhone(ledger) {
  return ledger?.LEDGERMOBILE ||
         ledger?.LEDGERPHONE ||
         ledger?.['CONTACTDETAILS.LIST']?.PHONENUMBER ||
         '';
}

function extractGST(ledger) {
  return ledger?.PARTYGSTIN ||
         ledger?.LEDGSTIN ||
         ledger?.GSTREGISTRATIONNUMBER ||
         '';
}

// ─────────────────────────────────────────
// CUSTOMERS
// ─────────────────────────────────────────
function mapCustomers(tallyJson, groupName, salesmanName) {
  const rows = extractLedgers(tallyJson);

  console.log('=== FILTERING CUSTOMERS ===');
  console.log('Total ledgers before filter:', rows.length);
  console.log('Filter by group:', groupName || '(none)');
  console.log('Filter by salesman:', salesmanName || '(none)');

  const filteredByGroup = groupName
    ? rows.filter((l) => (l?.PARENT || '').toLowerCase() === groupName.toLowerCase())
    : rows;

  console.log('After group filter:', filteredByGroup.length);

  const filtered = salesmanName
    ? filteredByGroup.filter((l) => getSalesmanName(l).toLowerCase() === salesmanName.toLowerCase())
    : filteredByGroup;

  console.log('After salesman filter:', filtered.length);
  console.log('===========================');

  return filtered.map((l) => ({
    code: extractCustomerName(l),
    name: extractCustomerName(l),
    phone: extractPhone(l),
    email: l?.EMAIL || '',
    gst: extractGST(l),
    address: extractAddress(l),
    salesman: getSalesmanName(l),
    parent: l?.PARENT || '',
  }));
}

// ─────────────────────────────────────────
// INVOICES
// ─────────────────────────────────────────
function mapInvoices(tallyJson) {
  const tallyMessages = tallyJson?.ENVELOPE?.BODY?.IMPORTDATA?.REQUESTDATA?.TALLYMESSAGE || [];

  const vouchers = toArray(tallyMessages)
    .filter(item => item && item.VOUCHER)
    .map(item => item.VOUCHER);

  const data = tallyJson?.ENVELOPE?.BODY?.DATA || {};
  const collection = data?.COLLECTION || {};
  const oldTallyMessage = data?.TALLYMESSAGE || {};

  const oldCandidates = [
    collection?.VOUCHER,
    collection?.VOUCHERLIST,
    collection?.VOUCHERLIST?.VOUCHER,
    data?.VOUCHER,
    oldTallyMessage?.VOUCHER,
  ];

  const oldVouchers = oldCandidates.flatMap((c) => toArray(c));
  const allVouchers = [...vouchers, ...oldVouchers];

  return allVouchers.map((v) => {
    const inventory = toArray(
      v?.['INVENTORYENTRIES.LIST']?.INVENTORYENTRY ||
      v?.INVENTORYENTRIES?.INVENTORYENTRY
    );

    const items = inventory.map((i) => ({
      name: i?.STOCKITEMNAME || '',
      quantity: i?.BILLEDQTY || i?.ACTUALQTY || '',
      rate: i?.RATE || '',
      amount: i?.AMOUNT || '',
    }));

    return {
      invoiceNo: v?.VOUCHERNUMBER || '',
      date: v?.DATE || '',
      customerName: v?.PARTYLEDGERNAME || '',
      items,
      totalAmount: v?.AMOUNT || v?.VOUCHERTOTAL || '',
    };
  });
}

// ─────────────────────────────────────────
// STOCK HELPERS
// ─────────────────────────────────────────
function extractStockName(item) {
  const oldName = item?.['OLDMAILINGNAME.LIST']?.OLDMAILINGNAME;
  if (oldName && oldName.trim()) return oldName.trim();

  const langName = item?.['LANGUAGENAME.LIST']?.['NAME.LIST']?.NAME;
  if (langName) {
    return Array.isArray(langName) ? langName[0] : langName;
  }

  return item?.NAME || item?.STOCKITEMNAME || '';
}

function extractHSN(item) {
  return item?.['HSNDETAILS.LIST']?.HSNCODE ||
         item?.HSNCODE ||
         item?.HSN ||
         '';
}

function extractGSTRate(item) {
  const gstDetails = item?.['GSTDETAILS.LIST'];
  if (!gstDetails) return { cgst: 0, sgst: 0, igst: 0, total: 0 };

  const stateDetails = gstDetails?.['STATEWISEDETAILS.LIST'];
  const rateList = toArray(stateDetails?.['RATEDETAILS.LIST']);

  let cgst = 0, sgst = 0, igst = 0;

  rateList.forEach(rate => {
    const head = rate?.GSTRATEDUTYHEAD || '';
    const value = parseFloat(rate?.GSTRATE || 0);
    if (head === 'CGST') cgst = value;
    if (head === 'SGST/UTGST') sgst = value;
    if (head === 'IGST') igst = value;
  });

  return { cgst, sgst, igst, total: cgst + sgst };
}

// ─────────────────────────────────────────
// STOCK
// ─────────────────────────────────────────
function mapStock(tallyJson) {
  console.log('=== EXTRACTING STOCK ITEMS ===');

  const tallyMessages = tallyJson?.ENVELOPE?.BODY?.IMPORTDATA?.REQUESTDATA?.TALLYMESSAGE || [];

  const stockItems = toArray(tallyMessages)
    .filter(item => item && item.STOCKITEM)
    .map(item => item.STOCKITEM);

  console.log('Found STOCKITEM objects:', stockItems.length);

  return stockItems.map((s) => {
    const gstRate = extractGSTRate(s);

    return {
      name: extractStockName(s),
      parent: s?.PARENT || '',
      uom: s?.BASEUNITS || s?.UOM || '',
      hsnCode: extractHSN(s),
      gst: {
        cgst: gstRate.cgst,
        sgst: gstRate.sgst,
        igst: gstRate.igst,
        totalRate: gstRate.total,
      },
      openingBalance: s?.OPENINGBALANCE || '',
      openingValue: s?.OPENINGVALUE || '',
      closingBalance: s?.CLOSINGBALANCE || '',
      closingValue: s?.CLOSINGVALUE || '',
      costPrice: s?.COSTPRICE || '',
      sellingPrice: s?.SELLINGPRICE || '',
      mrp: s?.MRP || '',
    };
  });
}

// ─────────────────────────────────────────
// VOUCHERS
// ─────────────────────────────────────────
function formatTallyDate(dateStr) {
  if (!dateStr || dateStr.length !== 8) return dateStr;
  // Tally date format: YYYYMMDD → DD-MM-YYYY
  const yyyy = dateStr.substring(0, 4);
  const mm = dateStr.substring(4, 6);
  const dd = dateStr.substring(6, 8);
  return `${dd}-${mm}-${yyyy}`;
}

function mapVouchers(tallyJson) {
  console.log('=== EXTRACTING VOUCHERS ===');

  const tallyMessages = tallyJson?.ENVELOPE?.BODY?.IMPORTDATA?.REQUESTDATA?.TALLYMESSAGE || [];

  const vouchers = toArray(tallyMessages)
    .filter(item => item && item.VOUCHER)
    .map(item => item.VOUCHER);

  // Also check old paths
  const data = tallyJson?.ENVELOPE?.BODY?.DATA || {};
  const collection = data?.COLLECTION || {};
  const oldCandidates = [
    collection?.VOUCHER,
    data?.VOUCHER,
  ];
  const oldVouchers = oldCandidates.flatMap((c) => toArray(c));
  const allVouchers = [...vouchers, ...oldVouchers];

  console.log('Total vouchers found:', allVouchers.length);

  // Filter only Sales vouchers
  const salesVouchers = allVouchers.filter(v =>
    (v?.VOUCHERTYPENAME || '').toLowerCase() === 'sales'
  );

  console.log('Sales vouchers found:', salesVouchers.length);
  console.log('===========================');

  return salesVouchers.map((v) => {
    // Extract inventory items
    const inventoryEntries = toArray(
      v?.['ALLINVENTORYENTRIES.LIST'] ||
      v?.['INVENTORYENTRIES.LIST'] ||
      v?.INVENTORYENTRIES
    );

    const items = inventoryEntries.map((i) => ({
      itemName: i?.STOCKITEMNAME || '',
      quantity: i?.BILLEDQTY || i?.ACTUALQTY || '',
      rate: i?.RATE || '',
      amount: i?.AMOUNT || '',
      discount: i?.DISCOUNT || '',
      hsnCode: i?.HSNCODE || '',
    }));

    // Extract ledger entries (tax, discount etc)
    const ledgerEntries = toArray(
      v?.['LEDGERENTRIES.LIST'] ||
      v?.LEDGERENTRIES
    );

    // Extract GST amounts
    let cgst = '', sgst = '', igst = '';
    ledgerEntries.forEach(entry => {
      const name = (entry?.LEDGERNAME || '').toLowerCase();
      if (name.includes('cgst')) cgst = entry?.AMOUNT || '';
      if (name.includes('sgst')) sgst = entry?.AMOUNT || '';
      if (name.includes('igst')) igst = entry?.AMOUNT || '';
    });

    return {
      voucherNumber: v?.VOUCHERNUMBER || '',
      date: formatTallyDate(v?.DATE || ''),
      voucherType: v?.VOUCHERTYPENAME || '',
      customerName: v?.PARTYLEDGERNAME || '',
      narration: v?.NARRATION || '',
      totalAmount: v?.AMOUNT || '',
      items,
      gst: { cgst, sgst, igst },
      enteredBy: v?.ENTEREDBY || '',
      guid: v?.GUID || '',
    };
  });
}

// ─────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────
module.exports = {
  mapCustomers,
  mapInvoices,
  mapStock,
  mapVouchers,
  toArray,
};
const dataset = window.SAP_FINDER_DATA || {
  generatedAt: "",
  recordCount: 0,
  categoryCount: 0,
  branches: [],
  categories: [],
  items: [],
};

const state = {
  searchTerm: "",
  selectedBranch: "All",
  selectedItemId: null,
  maxVisibleResults: 160,
  activeView: "finder",
};

const familyConfig = {
  colorbond055: {
    label: "Colorbond 0.55",
    buildCode: ({ girth, folds, colour }) => `${girth}C${folds}F${colour}`,
    usesColour: true,
    itemGroup: "FLASHINGS - COLORBOND",
  },
  matt055: {
    label: "Matt 0.55",
    buildCode: ({ girth, folds, colour }) => `${girth}CM${folds}F${colour}`,
    usesColour: true,
    itemGroup: "FLASHINGS - MATT",
  },
  colorbond07: {
    label: "Colorbond 0.7",
    buildCode: ({ girth, folds, colour }) => `${girth}C7${folds}F${colour}`,
    usesColour: true,
    itemGroup: "FLASHINGS - CB 0.7bmt",
  },
  colorbond10: {
    label: "Colorbond 1.0",
    buildCode: ({ girth, folds, colour }) => `${girth}C1${folds}F${colour}`,
    usesColour: true,
    itemGroup: "FLASHINGS - CB 1bmt",
  },
  copper055: {
    label: "Copper 0.55",
    buildCode: ({ girth, folds }) => `${girth}COP${folds}F`,
    usesColour: false,
    itemGroup: "FLASHINGS - COPPER",
  },
};

const COLOUR_PALETTE = [
  { code: "BAS", name: "Basalt", hex: "#595651" },
  { code: "BLU", name: "Blue Gum", hex: "#607b86" },
  { code: "CLA", name: "Classic Cream", hex: "#ece5d1" },
  { code: "COT", name: "Cottage Green", hex: "#416553" },
  { code: "DEE", name: "Deep Ocean", hex: "#20435c" },
  { code: "DOV", name: "Dover White", hex: "#f4f4f4" },
  { code: "DUN", name: "Dune", hex: "#9c9488" },
  { code: "EVE", name: "Evening Haze", hex: "#c9c8bd" },
  { code: "GUL", name: "Gully", hex: "#70806d" },
  { code: "IRO", name: "Ironstone", hex: "#4b4d4a" },
  { code: "JAS", name: "Jasper", hex: "#6a3f41" },
  { code: "MAN", name: "Manor Red", hex: "#7a2f31" },
  { code: "MON", name: "Monument", hex: "#2f2f2f" },
  { code: "NIG", name: "Night Sky", hex: "#1f2428" },
  { code: "PAL", name: "Pale Eucalypt", hex: "#7d8f7a" },
  { code: "PAP", name: "Paperbark", hex: "#d9cfbe" },
  { code: "SHA", name: "Shale Grey", hex: "#b1b3b3" },
  { code: "SOU", name: "Southernly", hex: "#c9c9c1" },
  { code: "SUR", name: "Surfmist", hex: "#d9d9d6" },
  { code: "WAL", name: "Wallaby", hex: "#7f7a72" },
  { code: "WIN", name: "Windspray", hex: "#b9bec0" },
  { code: "WOO", name: "Woodland Grey", hex: "#4a4f45" },
];

const colourOptions = COLOUR_PALETTE.map((entry) => entry.code);

const COLOUR_NAME_TO_CODE = {
  "BASALT": "BAS",
  "BLUE GUM": "BLU",
  "CLASSIC CREAM": "CLA",
  "COTTAGE GREEN": "COT",
  "DEEP OCEAN": "DEE",
  "DOVER WHITE": "DOV",
  "DUNE": "DUN",
  "EVENING HAZE": "EVE",
  "GULLY": "GUL",
  "IRONSTONE": "IRO",
  "JASPER": "JAS",
  "MANOR RED": "MAN",
  "MONUMENT": "MON",
  "NIGHT SKY": "NIG",
  "PALE EUCALYPT": "PAL",
  "PAPERBARK": "PAP",
  "SHALE GREY": "SHA",
  "SOUTHERNLY": "SOU",
  "SURFMIST": "SUR",
  "WALLABY": "WAL",
  "WINDSPRAY": "WIN",
  "WOODLAND GREY": "WOO",
};

const COLOUR_NAMES = Object.keys(COLOUR_NAME_TO_CODE).sort((left, right) => right.length - left.length);

const INTERNAL_SOURCE_BRANCHES = [
  "STOCK",
  "SRSC - Gregory Hills",
  "SRSC - Narellan",
  "SRSC - Silverwater",
  "SRSC - Botany",
  "SRSC - Tuggerah",
  "SRSC - Penrith",
];

const STORAGE_KEYS = {
  customItems: "sap-finder-custom-items",
  orders: "sap-finder-orders",
  orderCounter: "sap-finder-order-counter",
  currentOrderItems: "sap-finder-current-order-items",
  salesOrderNo: "sap-finder-sales-order-no",
  warehouse: "sap-finder-warehouse",
  itemOverrides: "sap-finder-item-overrides",
  deletedItems: "sap-finder-deleted-items",
  suppliers: "sap-finder-suppliers",
  preferredFlags: "sap-finder-preferred-flags",
};

const elements = {
  appShell: document.querySelector(".app-shell"),
  finderSearchBlock: document.querySelector("#finderSearchBlock"),
  searchInput: document.querySelector("#searchInput"),
  resultsList: document.querySelector("#resultsList"),
  resultsMeta: document.querySelector("#resultsMeta"),
  visibleCount: document.querySelector("#visibleCount"),
  categoryCount: document.querySelector("#categoryCount"),
  activeBranch: document.querySelector("#activeBranch"),
  activeFilters: document.querySelector("#activeFilters"),
  clearFiltersButton: document.querySelector("#clearFiltersButton"),
  filterButton: document.querySelector("#filterButton"),
  sideHomeButton: document.querySelector("#sideHomeButton"),
  sideFilterButton: document.querySelector("#sideFilterButton"),
  sideAboutButton: document.querySelector("#sideAboutButton"),
  filterSheet: document.querySelector("#filterSheet"),
  branchOptions: document.querySelector("#branchOptions"),
  detailScreen: document.querySelector("#detailScreen"),
  backButton: document.querySelector("#backButton"),
  detailImageWrap: document.querySelector("#detailImageWrap"),
  detailCategory: document.querySelector("#detailCategory"),
  detailName: document.querySelector("#detailName"),
  detailBranch: document.querySelector("#detailBranch"),
  detailSapCode: document.querySelector("#detailSapCode"),
  detailBranchValue: document.querySelector("#detailBranchValue"),
  detailGroup: document.querySelector("#detailGroup"),
  detailDescription: document.querySelector("#detailDescription"),
  detailEditFields: document.querySelector("#detailEditFields"),
  detailEditName: document.querySelector("#detailEditName"),
  detailEditCode: document.querySelector("#detailEditCode"),
  detailEditBranch: document.querySelector("#detailEditBranch"),
  detailEditGroup: document.querySelector("#detailEditGroup"),
  detailEditDescription: document.querySelector("#detailEditDescription"),
  detailImageInput: document.querySelector("#detailImageInput"),
  detailImagePreview: document.querySelector("#detailImagePreview"),
  detailBranchOptions: document.querySelector("#detailBranchOptions"),
  detailFallbackBranchSelect: document.querySelector("#detailFallbackBranchSelect"),
  detailSupplierOptions: document.querySelector("#detailSupplierOptions"),
  detailSupplierInput: document.querySelector("#detailSupplierInput"),
  detailAddSupplierButton: document.querySelector("#detailAddSupplierButton"),
  copySapButton: document.querySelector("#copySapButton"),
  detailPreferredCheckbox: document.querySelector("#detailPreferredCheckbox"),
  editDetailItemButton: document.querySelector("#editDetailItemButton"),
  saveDetailItemButton: document.querySelector("#saveDetailItemButton"),
  cancelDetailEditButton: document.querySelector("#cancelDetailEditButton"),
  deleteDetailItemButton: document.querySelector("#deleteDetailItemButton"),
  copyFeedback: document.querySelector("#copyFeedback"),
  listPanel: document.querySelector(".list-panel"),
  calculatorScreen: document.querySelector("#calculatorScreen"),
  addItemScreen: document.querySelector("#addItemScreen"),
  aboutScreen: document.querySelector("#aboutScreen"),
  floatingCalculatorButton: document.querySelector("#floatingCalculatorButton"),
  floatingAddItemButton: document.querySelector("#floatingAddItemButton"),
  calculatorBackButton: document.querySelector("#calculatorBackButton"),
  addItemBackButton: document.querySelector("#addItemBackButton"),
  aboutBackButton: document.querySelector("#aboutBackButton"),
  sidesInput: document.querySelector("#sidesInput"),
  sidesPad: document.querySelector("#sidesPad"),
  standardFoldsInput: document.querySelector("#standardFoldsInput"),
  crushReturnInput: document.querySelector("#crushReturnInput"),
  familySelect: document.querySelector("#familySelect"),
  colourField: document.querySelector("#colourField"),
  colourSelect: document.querySelector("#colourSelect"),
  colourSwatchesField: document.querySelector("#colourSwatchesField"),
  colourSwatches: document.querySelector("#colourSwatches"),
  colourLegendList: document.querySelector("#colourLegendList"),
  qtyInput: document.querySelector("#qtyInput"),
  lengthInput: document.querySelector("#lengthInput"),
  taperingCheckbox: document.querySelector("#taperingCheckbox"),
  girthLine: document.querySelector("#girthLine"),
  actualGirthLine: document.querySelector("#actualGirthLine"),
  summaryLine: document.querySelector("#summaryLine"),
  finalOutput: document.querySelector("#finalOutput"),
  matchResults: document.querySelector("#matchResults"),
  addToOrderButton: document.querySelector("#addToOrderButton"),
  clearFlashingButton: document.querySelector("#clearFlashingButton"),
  salesOrderInput: document.querySelector("#salesOrderInput"),
  warehouseInput: document.querySelector("#warehouseInput"),
  finalizeOrderButton: document.querySelector("#finalizeOrderButton"),
  currentOrderList: document.querySelector("#currentOrderList"),
  ordersTodayList: document.querySelector("#ordersTodayList"),
  copyAllButton: document.querySelector("#copyAllButton"),
  copyAllFeedback: document.querySelector("#copyAllFeedback"),
  customNameInput: document.querySelector("#customNameInput"),
  customCodeInput: document.querySelector("#customCodeInput"),
  customNotesInput: document.querySelector("#customNotesInput"),
  customImageInput: document.querySelector("#customImageInput"),
  customImagePreview: document.querySelector("#customImagePreview"),
  customFormHeading: document.querySelector("#customFormHeading"),
  internalSourceOptions: document.querySelector("#internalSourceOptions"),
  customFallbackBranchSelect: document.querySelector("#customFallbackBranchSelect"),
  externalSuppliersList: document.querySelector("#externalSuppliersList"),
  externalSupplierInput: document.querySelector("#externalSupplierInput"),
  addExternalSupplierButton: document.querySelector("#addExternalSupplierButton"),
  customPreferredInput: document.querySelector("#customPreferredInput"),
  saveCustomItemButton: document.querySelector("#saveCustomItemButton"),
  cancelEditItemButton: document.querySelector("#cancelEditItemButton"),
  customSaveFeedback: document.querySelector("#customSaveFeedback"),
  customItemsList: document.querySelector("#customItemsList"),
};

function setFinderSearchVisible(isVisible) {
  if (!elements.finderSearchBlock) {
    return;
  }
  elements.finderSearchBlock.hidden = !isVisible;
}

function setActiveView(view) {
  state.activeView = view;
  const calculatorActive = view === "calculator";
  if (elements.appShell) {
    elements.appShell.classList.toggle("app-shell--calculator-view", calculatorActive);
  }
  setFinderSearchVisible(!calculatorActive);
}

const calculatorState = {
  sidesRaw: "",
  standardFolds: 0,
  crushReturn: 0,
  isTapering: false,
  family: "colorbond055",
  colour: "MON",
  qty: 1,
  qtyRaw: "1",
  length: 1,
  lengthRaw: "1",
  orders: [],
  currentOrderItems: [],
  salesOrderNo: "",
  warehouse: "",
  orderCounter: 1,
  expandedOrderId: null,
  editingFinalizedOrderId: null,
  editingFinalizedOrderSalesOrderNo: "",
  customItems: [
    {
      uid: "custom-green-plug-35mm",
      name: "Green Plug 35mm",
      code: "GPLUG35PK",
      notes: "Sell as pack of 25. Boxes = 20 packs. Do not sell boxes.",
      preferred: true,
      sources: ["SRSC - Gregory Hills"],
      imageUrl: "",
    },
  ],
  customSelectedBranches: [],
  customExternalSuppliers: [],
  customFallbackBranch: "",
  editingCustomItemIndex: null,
  editingItemRef: null,
  itemOverrides: {},
  deletedItems: [],
  editingCurrentOrderIndex: null,
  isDetailEditing: false,
  suppliers: ["Eureka", "Metroll"],
  preferredFlags: {},
  detailSelectedBranches: [],
  detailSelectedSuppliers: [],
  detailFallbackBranch: "",
  customImageDataUrl: "",
  detailImageDataUrl: "",
};

function parseDecimalInput(rawValue, fallback = 0) {
  const normalized = String(rawValue ?? "").trim().replace(",", ".");
  if (!normalized) {
    return fallback;
  }
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function sanitizeDecimalRawInput(rawValue) {
  const value = String(rawValue ?? "");
  let normalized = value.replace(",", ".").replace(/[^0-9.]/g, "");
  const firstDotIndex = normalized.indexOf(".");
  if (firstDotIndex !== -1) {
    normalized = `${normalized.slice(0, firstDotIndex + 1)}${normalized.slice(firstDotIndex + 1).replace(/\./g, "")}`;
  }
  if (normalized === ".") {
    return "0.";
  }
  return normalized;
}

function parseSavedJson(storageKey, fallbackValue) {
  const rawValue = window.localStorage.getItem(storageKey);
  if (!rawValue) {
    return fallbackValue;
  }

  try {
    return JSON.parse(rawValue);
  } catch (error) {
    console.warn(`Unable to parse saved key: ${storageKey}`, error);
    return fallbackValue;
  }
}

function loadPersistedState() {
  const parsedCustomItems = parseSavedJson(STORAGE_KEYS.customItems, null);
  const parsedOrders = parseSavedJson(STORAGE_KEYS.orders, null);
  const parsedCurrentOrderItems = parseSavedJson(STORAGE_KEYS.currentOrderItems, null);
  const parsedOverrides = parseSavedJson(STORAGE_KEYS.itemOverrides, null);
  const parsedDeletedItems = parseSavedJson(STORAGE_KEYS.deletedItems, null);
  const parsedSuppliers = parseSavedJson(STORAGE_KEYS.suppliers, null);
  const parsedPreferredFlags = parseSavedJson(STORAGE_KEYS.preferredFlags, null);

  const savedOrderCounter = window.localStorage.getItem(STORAGE_KEYS.orderCounter);
  const savedSalesOrderNo = window.localStorage.getItem(STORAGE_KEYS.salesOrderNo);
  const savedWarehouse = window.localStorage.getItem(STORAGE_KEYS.warehouse);

  if (Array.isArray(parsedCustomItems) && parsedCustomItems.length > 0) {
    calculatorState.customItems = parsedCustomItems.map((item, index) => ({
      uid: item.uid || `custom-${index}-${Date.now()}`,
      ...item,
    }));
  }

  if (Array.isArray(parsedOrders)) {
    calculatorState.orders = parsedOrders
      .filter((entry) => entry && typeof entry === "object")
      .map((order, index) => ({
        orderId: Number(order.orderId) || index + 1,
        salesOrderNo: String(order.salesOrderNo || ""),
        timestamp: String(order.timestamp || ""),
        items: Array.isArray(order.items)
          ? order.items.map((item) => ({
              finalOutput: String(item?.finalOutput || ""),
              summaryLine: String(item?.summaryLine || ""),
              girthLine: String(item?.girthLine || ""),
              actualGirthLine: String(item?.actualGirthLine || ""),
            }))
          : [],
      }));
  }

  if (savedOrderCounter) {
    const parsedCounter = Number(savedOrderCounter);
    if (Number.isFinite(parsedCounter) && parsedCounter > 0) {
      calculatorState.orderCounter = parsedCounter;
    }
  }

  if (Array.isArray(parsedCurrentOrderItems)) {
    calculatorState.currentOrderItems = parsedCurrentOrderItems;
  }

  if (typeof savedSalesOrderNo === "string") {
    calculatorState.salesOrderNo = savedSalesOrderNo;
  }

  if (typeof savedWarehouse === "string") {
    calculatorState.warehouse = savedWarehouse;
  }

  if (parsedOverrides && typeof parsedOverrides === "object") {
    calculatorState.itemOverrides = parsedOverrides;
  }

  if (Array.isArray(parsedDeletedItems)) {
    calculatorState.deletedItems = parsedDeletedItems;
  }

  if (Array.isArray(parsedSuppliers) && parsedSuppliers.length > 0) {
    calculatorState.suppliers = [...new Set(parsedSuppliers.map((entry) => normalizeSupplierName(entry)).filter(Boolean))];
    persistSuppliers();
  }

  if (parsedPreferredFlags && typeof parsedPreferredFlags === "object") {
    calculatorState.preferredFlags = parsedPreferredFlags;
  }
}

function persistCustomItems() {
  try {
    window.localStorage.setItem(
      STORAGE_KEYS.customItems,
      JSON.stringify(calculatorState.customItems)
    );
  } catch (error) {
    console.warn("Unable to save custom items.", error);
  }
}

function persistOrders() {
  try {
    window.localStorage.setItem(
      STORAGE_KEYS.orders,
      JSON.stringify(calculatorState.orders)
    );
    window.localStorage.setItem(
      STORAGE_KEYS.orderCounter,
      String(calculatorState.orderCounter)
    );
  } catch (error) {
    console.warn("Unable to save orders.", error);
  }
}

function persistCurrentOrder() {
  try {
    window.localStorage.setItem(
      STORAGE_KEYS.currentOrderItems,
      JSON.stringify(calculatorState.currentOrderItems)
    );
    window.localStorage.setItem(
      STORAGE_KEYS.salesOrderNo,
      calculatorState.salesOrderNo
    );
    window.localStorage.setItem(
      STORAGE_KEYS.warehouse,
      calculatorState.warehouse
    );
  } catch (error) {
    console.warn("Unable to save current order.", error);
  }
}

function persistItemChanges() {
  try {
    window.localStorage.setItem(
      STORAGE_KEYS.itemOverrides,
      JSON.stringify(calculatorState.itemOverrides)
    );
    window.localStorage.setItem(
      STORAGE_KEYS.deletedItems,
      JSON.stringify(calculatorState.deletedItems)
    );
  } catch (error) {
    console.warn("Unable to save item changes.", error);
  }
}

function persistSuppliers() {
  try {
    window.localStorage.setItem(
      STORAGE_KEYS.suppliers,
      JSON.stringify(calculatorState.suppliers)
    );
  } catch (error) {
    console.warn("Unable to save suppliers.", error);
  }
}

function normalizeSupplierName(value) {
  const normalized = String(value || "")
    .replace(/^(SUP:\s*)+/i, "")
    .replace(/\s+/g, " ")
    .trim();
  if (/^stramit codes$/i.test(normalized)) {
    return "Stramit";
  }
  return normalized;
}

function inferSupplierFromSapCode(sapCode) {
  const code = String(sapCode || "").trim().toUpperCase();
  if (code.startsWith("LYS")) {
    return "Lysaght";
  }
  if (code.startsWith("MET")) {
    return "MET";
  }
  if (code.startsWith("STR")) {
    return "Stramit";
  }
  return "";
}

function isSupplierMappedCodeItem(item) {
  return Boolean(inferSupplierFromSapCode(item?.sapCode || item?.code));
}

function getSearchMatchRank(item, query) {
  const normalizedQuery = String(query || "").trim().toUpperCase();
  if (!normalizedQuery) {
    return 99;
  }

  const sapCode = String(item?.sapCode || "").toUpperCase();
  const itemName = String(item?.itemName || "").toUpperCase();
  const itemDescription = String(item?.itemDescription || "").toUpperCase();

  if (sapCode === normalizedQuery) {
    return 0;
  }
  if (sapCode.startsWith(normalizedQuery)) {
    return 1;
  }
  if (sapCode.includes(normalizedQuery)) {
    return 2;
  }
  if (itemName.startsWith(normalizedQuery)) {
    return 3;
  }
  if (itemName.includes(normalizedQuery)) {
    return 4;
  }
  if (itemDescription.includes(normalizedQuery)) {
    return 5;
  }
  return 6;
}

function getNozSearchTier(item, query) {
  const normalizedQuery = String(query || "").trim().toUpperCase();
  if (!normalizedQuery.startsWith("NOZ")) {
    return null;
  }

  const sapCode = String(item?.sapCode || "").trim().toUpperCase();
  if (sapCode.startsWith("NOZ")) {
    return 1;
  }
  if (sapCode.startsWith("HRN")) {
    return 3;
  }
  if (isSupplierMappedCodeItem(item)) {
    return 4;
  }
  return 2;
}

function confirmDeleteAction(targetLabel) {
  return window.confirm(`Delete "${targetLabel}" permanently?`);
}

function persistPreferredFlags() {
  try {
    window.localStorage.setItem(
      STORAGE_KEYS.preferredFlags,
      JSON.stringify(calculatorState.preferredFlags)
    );
  } catch (error) {
    console.warn("Unable to save preferred flags.", error);
  }
}

const branchList = ["All", ...(dataset.branches || [])];
const items = (dataset.items || []).map((item) => ({
  ...item,
  searchIndex: [
    item.itemName,
    item.sapCode,
    item.sourcingBranch,
    item.itemDescription,
    item.itemGroup,
    item.category,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase(),
}));

let cachedCatalogItems = null;

function markCatalogDirty() {
  cachedCatalogItems = null;
}

function getPreferredFlag(itemId, fallbackValue) {
  if (Object.prototype.hasOwnProperty.call(calculatorState.preferredFlags, itemId)) {
    return Boolean(calculatorState.preferredFlags[itemId]);
  }
  return Boolean(fallbackValue);
}

function setPreferredFlag(itemId, isPreferred) {
  if (!itemId) {
    return;
  }

  calculatorState.preferredFlags[itemId] = Boolean(isPreferred);
  persistPreferredFlags();
  markCatalogDirty();
}

function getCatalogItems() {
  if (cachedCatalogItems) {
    return cachedCatalogItems;
  }

  const customLookupItems = calculatorState.customItems
    .filter((item) => !calculatorState.deletedItems.includes(`custom:${item.uid}`))
    .map((item) => {
      const itemId = `custom:${item.uid}`;
      const sourceData = normalizeItemSourceData(item);
      const sourceSummary = buildSourceSummary(
        sourceData.branches,
        sourceData.suppliers,
        sourceData.fallbackBranch
      );
      const preferred = getPreferredFlag(itemId, item.preferred);

      return {
        id: itemId,
        itemName: item.name,
        sapCode: item.code,
        sourcingBranch: sourceSummary || "Custom",
        itemDescription: `${item.notes || "Custom saved item"}${sourceSummary ? ` | Source: ${sourceSummary}` : ""}`,
        imageUrl: item.imageUrl || "",
        itemGroup: preferred ? "Preferred Custom Code" : "Custom Code",
        category: "Custom Items",
        preferred,
        sources: sourceData.sources,
        fallbackBranch: sourceData.fallbackBranch,
        searchIndex: [
          item.name,
          item.code,
          item.notes,
          preferred ? "preferred" : "",
          "custom items",
          sourceSummary,
          ...sourceData.sources,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase(),
      };
    });

  const importedItems = items
    .filter((item) => !calculatorState.deletedItems.includes(`base:${item.id}`))
    .map((item) => {
      const override = calculatorState.itemOverrides[`base:${item.id}`] || {};
      const merged = {
        ...item,
        ...override,
      };
      const itemId = `base:${item.id}`;
      const sourceData = normalizeItemSourceData(merged);
      const preferred = getPreferredFlag(itemId, merged.preferred);
      return {
        ...merged,
        id: itemId,
        preferred,
        sources: sourceData.sources,
        fallbackBranch: sourceData.fallbackBranch,
        searchIndex: [
          merged.itemName,
          merged.sapCode,
          merged.sourcingBranch,
          merged.itemDescription,
          merged.itemGroup,
          merged.category,
          preferred ? "preferred" : "",
          ...sourceData.sources,
          sourceData.fallbackBranch,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase(),
      };
    });

  const wildcardMasterCodes = new Set(
    importedItems
      .map((item) => String(item.sapCode || "").trim().toUpperCase())
      .filter((code) => code.endsWith("***"))
  );

  const deDuplicatedImportedItems = importedItems.filter((item) => {
    const sapCode = String(item.sapCode || "").trim().toUpperCase();
    if (sapCode.endsWith("***")) {
      return true;
    }

    const maybeColourSuffix = sapCode.slice(-3);
    const maybeWildcardMaster = `${sapCode.slice(0, -3)}***`;
    const hasWildcardMaster = wildcardMasterCodes.has(maybeWildcardMaster);
    const isColourVariant = colourOptions.includes(maybeColourSuffix);

    return !(hasWildcardMaster && isColourVariant);
  });

  const groupedItems = buildGroupedVariantItems(deDuplicatedImportedItems)
    .filter((item) => !calculatorState.deletedItems.includes(item.id))
    .map((item) => {
      const groupOverride = calculatorState.itemOverrides[item.id];
      if (!groupOverride) {
        return item;
      }

      const merged = {
        ...item,
        ...groupOverride,
      };

      const mergedSearchIndex = [
        merged.itemName,
        merged.sapCode,
        merged.sourcingBranch,
        merged.itemDescription,
        merged.itemGroup,
        merged.category,
        merged.preferred ? "preferred" : "",
        ...(merged.availableColours || []),
        ...(merged.groupedVariants || []).map((variant) => variant.itemName),
        ...(merged.groupedVariants || []).map((variant) => variant.sapCode),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return {
        ...merged,
        searchIndex: mergedSearchIndex,
      };
    });

  cachedCatalogItems = applyWildcardMasterDedup([...customLookupItems, ...groupedItems]);
  return cachedCatalogItems;
}

function applyWildcardMasterDedup(catalogItems) {
  const wildcardMasterCodes = new Set(
    catalogItems
      .map((item) => String(item.sapCode || "").trim().toUpperCase())
      .filter((code) => code.endsWith("***"))
  );

  if (wildcardMasterCodes.size === 0) {
    return catalogItems;
  }

  return catalogItems.filter((item) => {
    const sapCode = String(item.sapCode || "").trim().toUpperCase();
    if (!sapCode) {
      return true;
    }
    if (sapCode.endsWith("***")) {
      return true;
    }

    const suffix = sapCode.slice(-3);
    const wildcardMatch = `${sapCode.slice(0, -3)}***`;
    const isColourSuffix = colourOptions.includes(suffix);

    return !(isColourSuffix && wildcardMasterCodes.has(wildcardMatch));
  });
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderImagePreview(container, imageUrl, altText) {
  if (!imageUrl) {
    container.hidden = true;
    container.innerHTML = "";
    return;
  }

  container.hidden = false;
  container.innerHTML = `<img src="${imageUrl}" alt="${escapeHtml(altText || "Item image")}">`;
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function normalizeItemSourceData(item) {
  const rawSources = Array.isArray(item.sources) ? item.sources.filter(Boolean) : [];
  const rawSummary = String(item.sourcingBranch || "");
  const fallbackFromSummary = (rawSummary.match(/Order If Out:\s*([^|]+)/i)?.[1] || "").trim();
  const branches = [];
  const suppliers = [];

  rawSources.forEach((value) => {
    if (INTERNAL_SOURCE_BRANCHES.includes(value)) {
      branches.push(value);
      return;
    }

    if (value.startsWith("SUP:")) {
      const supplier = normalizeSupplierName(value);
      if (supplier) {
        suppliers.push(supplier);
      }
    }
  });

  if (rawSources.length === 0 && rawSummary) {
    rawSummary
      .split("|")
      .map((part) => part.trim())
      .filter(Boolean)
      .forEach((part) => {
        if (/^SUP:/i.test(part)) {
          part
            .replace(/^(SUP:\s*)+/i, "")
            .split(",")
            .map((entry) => normalizeSupplierName(entry))
            .filter(Boolean)
            .forEach((supplier) => suppliers.push(supplier));
          return;
        }

        if (/^Order If Out:/i.test(part)) {
          return;
        }

        part
          .split(",")
          .map((entry) => entry.trim())
          .filter(Boolean)
          .forEach((branch) => {
            if (INTERNAL_SOURCE_BRANCHES.includes(branch)) {
              branches.push(branch);
            }
          });
      });
  }

  const uniqueBranches = [...new Set(branches)];
  const inferredSupplier = inferSupplierFromSapCode(item.sapCode || item.code);
  if (inferredSupplier) {
    suppliers.push(inferredSupplier);
  }

  const uniqueSuppliers = [...new Set(suppliers)];
  const fallbackBranch = INTERNAL_SOURCE_BRANCHES.includes(item.fallbackBranch)
    ? item.fallbackBranch
    : (INTERNAL_SOURCE_BRANCHES.includes(fallbackFromSummary) ? fallbackFromSummary : "");

  return {
    branches: uniqueBranches,
    suppliers: uniqueSuppliers,
    fallbackBranch,
    sources: [
      ...uniqueBranches,
      ...uniqueSuppliers.map((supplier) => `SUP: ${supplier}`),
    ],
  };
}

function detectColourName(item) {
  const haystack = String(item.itemName || item.name || "").toUpperCase().trim();
  return COLOUR_NAMES.find((colourName) => haystack.endsWith(colourName)) || "";
}

function stripTrailingColour(itemName, colourName) {
  if (!colourName) {
    return itemName;
  }

  const suffixPattern = new RegExp(`\\s+${colourName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i");
  return String(itemName || "").replace(suffixPattern, "").trim();
}

function buildGroupedVariantItems(importedItems) {
  const groupedMap = new Map();
  const passthroughItems = [];

  importedItems.forEach((item, index) => {
    const colourName = detectColourName(item);
    const colourCode = COLOUR_NAME_TO_CODE[colourName] || "";
    const sapCode = String(item.sapCode || "").trim();
    const isFasciaCover = /FASCIA\s+COVER/i.test(String(item.itemName || ""));
    let codePattern = colourCode && sapCode.endsWith(colourCode)
      ? `${sapCode.slice(0, -3)}***`
      : "";

    if (isFasciaCover && /FCC/i.test(sapCode)) {
      codePattern = "FCC***";
    }

    if (!colourName || !codePattern) {
      passthroughItems.push(item);
      return;
    }

    const baseName = stripTrailingColour(item.itemName, colourName);
    const groupKey = [
      item.category || "",
      baseName,
      codePattern,
    ].join("::");

    if (!groupedMap.has(groupKey)) {
      groupedMap.set(groupKey, {
        id: `group:${groupKey}`,
        itemName: baseName,
        sapCode: codePattern,
        sourcingBranch: item.sourcingBranch,
        itemDescription: item.itemDescription,
        imageUrl: item.imageUrl,
        itemGroup: item.itemGroup,
        category: item.category,
        preferred: item.preferred,
        sources: item.sources || [],
        fallbackBranch: item.fallbackBranch || "",
        groupedVariants: [],
        groupedVariantKey: groupKey,
        groupedFromColorVariants: true,
        groupedFirstIndex: index,
      });
    }

    groupedMap.get(groupKey).groupedVariants.push({
      id: item.id,
      itemName: item.itemName,
      sapCode: item.sapCode,
      colourName,
      colourCode,
    });
  });

  const collapsedGroups = [];

  groupedMap.forEach((group) => {
    if (group.groupedVariants.length < 2) {
      const originalVariant = importedItems.find((item) => item.id === group.groupedVariants[0]?.id);
      if (originalVariant) {
        passthroughItems.push(originalVariant);
      }
      return;
    }

    const availableColours = group.groupedVariants
      .map((variant) => variant.colourName)
      .filter(Boolean)
      .sort((left, right) => left.localeCompare(right));

    const searchIndex = [
      group.itemName,
      group.sapCode,
      group.sourcingBranch,
      group.itemDescription,
      group.itemGroup,
      group.category,
      ...availableColours,
      ...group.groupedVariants.map((variant) => variant.itemName),
      ...group.groupedVariants.map((variant) => variant.sapCode),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    collapsedGroups.push({
      ...group,
      preferred: getPreferredFlag(group.id, group.preferred),
      itemDescription: `${group.itemName} | SAP pattern: ${group.sapCode} | Colours: ${availableColours.join(", ")}`,
      availableColours,
      searchIndex,
    });
  });

  return [...passthroughItems, ...collapsedGroups].sort((left, right) => {
    const leftIndex = left.groupedFirstIndex ?? importedItems.findIndex((item) => item.id === left.id);
    const rightIndex = right.groupedFirstIndex ?? importedItems.findIndex((item) => item.id === right.id);
    return leftIndex - rightIndex;
  });
}

function getFilteredItems() {
  const search = state.searchTerm.trim().toLowerCase();
  const rawQuery = state.searchTerm.trim();
  const showInitialEmpty = !search && state.selectedBranch === "All";
  if (showInitialEmpty) {
    return [];
  }
  const searchableItems = getCatalogItems();

  return searchableItems
    .filter((item) => {
      const matchesBranch =
        state.selectedBranch === "All" ||
        item.sourcingBranch === state.selectedBranch ||
        (state.selectedBranch === "Custom" && item.category === "Custom Items");
      const matchesSearch = !search || item.searchIndex.includes(search);

      return matchesBranch && matchesSearch;
    })
    .sort((left, right) => {
      const preferredDelta = Number(Boolean(right.preferred)) - Number(Boolean(left.preferred));
      if (preferredDelta !== 0) {
        return preferredDelta;
      }

      const leftNozTier = getNozSearchTier(left, rawQuery);
      const rightNozTier = getNozSearchTier(right, rawQuery);
      if (leftNozTier !== null && rightNozTier !== null) {
        const nozTierDelta = leftNozTier - rightNozTier;
        if (nozTierDelta !== 0) {
          return nozTierDelta;
        }
      }

      const supplierMappedDelta = Number(isSupplierMappedCodeItem(left)) - Number(isSupplierMappedCodeItem(right));
      if (supplierMappedDelta !== 0) {
        return supplierMappedDelta;
      }

      const rankDelta = getSearchMatchRank(left, rawQuery) - getSearchMatchRank(right, rawQuery);
      if (rankDelta !== 0) {
        return rankDelta;
      }

      return String(left.itemName || "").localeCompare(String(right.itemName || ""));
    });
}

function renderBranchOptions() {
  const counts = new Map();

  for (const item of items) {
    const current = counts.get(item.sourcingBranch) || 0;
    counts.set(item.sourcingBranch, current + 1);
  }

  elements.branchOptions.innerHTML = branchList
    .map((branch) => {
      const count = branch === "All" ? items.length : counts.get(branch) || 0;
      const activeClass = branch === state.selectedBranch ? " is-active" : "";
      return `
        <button class="branch-option${activeClass}" type="button" data-branch="${escapeHtml(branch)}">
          <span>${escapeHtml(branch)}</span>
          <span class="branch-option__count">${count}</span>
        </button>
      `;
    })
    .join("");
}

function renderActiveFilters(filteredItems) {
  const pills = [];

  if (state.selectedBranch !== "All") {
    pills.push(`<span class="filter-pill">Branch: ${escapeHtml(state.selectedBranch)}</span>`);
  }

  if (state.searchTerm.trim()) {
    pills.push(`<span class="filter-pill">Search: ${escapeHtml(state.searchTerm.trim())}</span>`);
  }

  elements.activeFilters.innerHTML = pills.join("");
  elements.activeFilters.hidden = pills.length === 0;
  elements.visibleCount.textContent = filteredItems.length.toLocaleString();
  elements.categoryCount.textContent = String((dataset.categories || []).length);
  elements.activeBranch.textContent = state.selectedBranch;
}

function renderResults() {
  const search = state.searchTerm.trim();
  const showInitialEmpty = !search && state.selectedBranch === "All";
  const filteredItems = getFilteredItems();
  const visibleItems = filteredItems.slice(0, state.maxVisibleResults);

  renderActiveFilters(filteredItems);

  elements.resultsMeta.textContent = showInitialEmpty
    ? "Start by searching an item name, SAP code, or alternate note name."
    : (
      filteredItems.length > state.maxVisibleResults
        ? `Showing the first ${state.maxVisibleResults.toLocaleString()} of ${filteredItems.length.toLocaleString()} matches. Narrow the search or filter by branch to refine the list.`
        : `${filteredItems.length.toLocaleString()} items available from ${branchList.length - 1} sourcing branches.`
    );

  if (visibleItems.length === 0) {
    elements.resultsList.innerHTML = `
      <div class="empty-state">
        <strong>${showInitialEmpty ? "No items shown yet." : "No matching items found."}</strong>
        <p>${showInitialEmpty ? "Use the search bar above to find products by code, name, or notes." : "Try a broader search term, or clear the branch filter to search the full workbook again."}</p>
      </div>
    `;
    return;
  }

  elements.resultsList.innerHTML = visibleItems
    .map(
      (item) => `
        <button class="list-row" type="button" role="listitem" data-item-id="${item.id}">
          <div class="list-row__top">
            <div>
              <h3 class="list-row__title">${escapeHtml(item.itemName || "Unnamed Item")}</h3>
              ${item.preferred ? `<span class="preferred-badge">Preferred</span>` : ""}
              ${item.groupedFromColorVariants ? `<span class="preferred-badge">Colour Family</span>` : ""}
              <p class="list-row__subtitle">${escapeHtml(item.sapCode || "No SAP code")}</p>
            </div>
            <span class="list-row__branch">${escapeHtml(item.sourcingBranch || "Unassigned")}</span>
          </div>
          <div class="list-row__meta">
            <span class="meta-badge">${escapeHtml(item.category || "Category Unknown")}</span>
            <span class="meta-badge">${escapeHtml(item.itemGroup || "Group Unspecified")}</span>
            ${item.groupedFromColorVariants ? `<span class="meta-badge">${escapeHtml(`${(item.availableColours || []).length} colours`)}</span>` : ""}
          </div>
        </button>
      `
    )
    .join("");
}

function openSheet() {
  elements.filterSheet.classList.add("is-open");
  elements.filterSheet.setAttribute("aria-hidden", "false");
}

function closeSheet() {
  elements.filterSheet.classList.remove("is-open");
  elements.filterSheet.setAttribute("aria-hidden", "true");
}

function renderDetailImage(item) {
  if (item.imageUrl) {
    elements.detailImageWrap.innerHTML = `<img src="${escapeHtml(item.imageUrl)}" alt="${escapeHtml(item.itemName)}">`;
    return;
  }

  elements.detailImageWrap.innerHTML = `
    <div class="detail-image__placeholder">
      <div>
        <div class="detail-card__label">No Image URL in workbook</div>
        <div>${escapeHtml(item.category || "Inventory Item")}</div>
      </div>
    </div>
  `;
}

function openDetail(itemId) {
  const item = getCatalogItems().find((entry) => String(entry.id) === String(itemId));
  if (!item) {
    return;
  }

  state.selectedItemId = item.id;
  calculatorState.isDetailEditing = false;
  renderDetailImage(item);
  elements.detailCategory.textContent = item.category || "Inventory";
  elements.detailName.textContent = item.itemName || "Unnamed Item";
  elements.detailBranch.textContent = `Source from ${item.sourcingBranch || "Unassigned branch"}`;
  elements.detailSapCode.textContent = item.sapCode || "No SAP code";
  elements.detailPreferredCheckbox.checked = Boolean(item.preferred);
  elements.detailBranchValue.textContent = item.sourcingBranch || "Unassigned";
  elements.detailGroup.textContent = item.itemGroup || "Unspecified";
  const variantSummary = item.groupedFromColorVariants
    ? `Available colours: ${(item.availableColours || []).join(", ")}`
    : "";
  elements.detailDescription.textContent = [item.itemDescription || "No description available.", variantSummary]
    .filter(Boolean)
    .join(" | ");
  elements.detailEditFields.hidden = true;
  elements.saveDetailItemButton.hidden = true;
  elements.cancelDetailEditButton.hidden = true;
  elements.editDetailItemButton.hidden = false;
  elements.deleteDetailItemButton.hidden = false;
  elements.copyFeedback.textContent = "";
  elements.detailScreen.classList.add("is-open");
  elements.detailScreen.setAttribute("aria-hidden", "false");
}

function closeDetail() {
  state.selectedItemId = null;
  calculatorState.isDetailEditing = false;
  elements.detailScreen.classList.remove("is-open");
  elements.detailScreen.setAttribute("aria-hidden", "true");
  elements.detailPreferredCheckbox.checked = false;
  elements.deleteDetailItemButton.hidden = false;
}

function updateItemPreferred(itemId, isPreferred) {
  if (!itemId) {
    return;
  }

  const preferredValue = Boolean(isPreferred);
  setPreferredFlag(itemId, preferredValue);

  if (itemId.startsWith("custom:")) {
    const uid = itemId.replace("custom:", "");
    calculatorState.customItems = calculatorState.customItems.map((item) =>
      item.uid === uid ? { ...item, preferred: preferredValue } : item
    );
    persistCustomItems();
  } else {
    calculatorState.itemOverrides[itemId] = {
      ...calculatorState.itemOverrides[itemId],
      preferred: preferredValue,
    };
    persistItemChanges();
  }

  markCatalogDirty();
  renderResults();
  renderCustomItems();
}

async function copySapCode() {
  const item = getCatalogItems().find((entry) => entry.id === state.selectedItemId);
  if (!item || !item.sapCode) {
    elements.copyFeedback.textContent = "No SAP code available to copy.";
    return;
  }

  try {
    await navigator.clipboard.writeText(item.sapCode);
    elements.copyFeedback.textContent = "SAP code copied.";
  } catch (error) {
    elements.copyFeedback.textContent = "Clipboard copy failed on this device.";
  }
}

function startDetailEdit() {
  const item = getCatalogItems().find((entry) => entry.id === state.selectedItemId);
  if (!item) {
    return;
  }

  calculatorState.isDetailEditing = true;
  elements.detailEditName.value = item.itemName || "";
  elements.detailEditCode.value = item.sapCode || "";
  elements.detailEditGroup.value = item.itemGroup || "";
  elements.detailEditDescription.value = item.itemDescription || "";
  calculatorState.detailImageDataUrl = item.imageUrl || "";
  elements.detailImageInput.value = "";
  renderImagePreview(elements.detailImagePreview, calculatorState.detailImageDataUrl, item.itemName || "");
  const sourceData = normalizeItemSourceData(item);
  calculatorState.detailSelectedBranches = sourceData.branches;
  calculatorState.detailSelectedSuppliers = sourceData.suppliers;
  calculatorState.detailFallbackBranch = sourceData.fallbackBranch;
  renderDetailSourceControls();
  elements.detailEditFields.hidden = false;
  elements.saveDetailItemButton.hidden = false;
  elements.cancelDetailEditButton.hidden = false;
  elements.editDetailItemButton.hidden = true;
}

function cancelDetailEdit() {
  calculatorState.isDetailEditing = false;
  calculatorState.detailSelectedBranches = [];
  calculatorState.detailSelectedSuppliers = [];
  calculatorState.detailFallbackBranch = "";
  calculatorState.detailImageDataUrl = "";
  elements.detailImageInput.value = "";
  renderImagePreview(elements.detailImagePreview, "", "");
  elements.detailEditFields.hidden = true;
  elements.saveDetailItemButton.hidden = true;
  elements.cancelDetailEditButton.hidden = true;
  elements.editDetailItemButton.hidden = false;
}

function saveDetailItem() {
  const itemId = state.selectedItemId;
  if (!itemId) {
    return;
  }

  const payload = {
    itemName: elements.detailEditName.value.trim(),
    sapCode: elements.detailEditCode.value.trim(),
    sourcingBranch: buildSourceSummary(
      calculatorState.detailSelectedBranches,
      calculatorState.detailSelectedSuppliers,
      calculatorState.detailFallbackBranch
    ),
    itemGroup: elements.detailEditGroup.value.trim(),
    itemDescription: elements.detailEditDescription.value.trim(),
  };

  if (!payload.itemName || !payload.sapCode) {
    elements.copyFeedback.textContent = "Item name and SAP code are required.";
    return;
  }

  if (itemId.startsWith("custom:")) {
    const uid = itemId.replace("custom:", "");
    calculatorState.customItems = calculatorState.customItems.map((item) =>
      item.uid === uid
        ? {
            ...item,
            name: payload.itemName,
            code: payload.sapCode,
            notes: payload.itemDescription,
            imageUrl: calculatorState.detailImageDataUrl,
            sources: [
              ...calculatorState.detailSelectedBranches,
              ...calculatorState.detailSelectedSuppliers.map((supplier) => `SUP: ${supplier}`),
            ],
            fallbackBranch: calculatorState.detailFallbackBranch,
          }
        : item
    );
    persistCustomItems();
  } else {
    calculatorState.itemOverrides[itemId] = {
      ...calculatorState.itemOverrides[itemId],
      itemName: payload.itemName,
      sapCode: payload.sapCode,
      sourcingBranch: payload.sourcingBranch,
      itemGroup: payload.itemGroup,
      itemDescription: payload.itemDescription,
      imageUrl: calculatorState.detailImageDataUrl,
      sources: [
        ...calculatorState.detailSelectedBranches,
        ...calculatorState.detailSelectedSuppliers.map((supplier) => `SUP: ${supplier}`),
      ],
      fallbackBranch: calculatorState.detailFallbackBranch,
    };
    persistItemChanges();
  }

  elements.copyFeedback.textContent = "Changes saved.";
  markCatalogDirty();
  renderResults();
  renderCustomItems();
  openDetail(itemId);
}

function clearFilters() {
  state.searchTerm = "";
  state.selectedBranch = "All";
  elements.searchInput.value = "";
  renderBranchOptions();
  renderResults();
}

function showCalculator() {
  setActiveView("calculator");
  elements.listPanel.hidden = true;
  elements.calculatorScreen.hidden = false;
  elements.addItemScreen.hidden = true;
  elements.aboutScreen.hidden = true;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showFinder() {
  setActiveView("finder");
  elements.calculatorScreen.hidden = true;
  elements.addItemScreen.hidden = true;
  elements.aboutScreen.hidden = true;
  elements.listPanel.hidden = false;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showAddItem() {
  setActiveView("add-item");
  elements.listPanel.hidden = true;
  elements.calculatorScreen.hidden = true;
  elements.addItemScreen.hidden = false;
  elements.aboutScreen.hidden = true;
  if (calculatorState.editingItemRef === null) {
    resetCustomItemForm();
  }
  renderSourceControls();
  renderCustomItems();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showAbout() {
  setActiveView("about");
  elements.listPanel.hidden = true;
  elements.calculatorScreen.hidden = true;
  elements.addItemScreen.hidden = true;
  elements.aboutScreen.hidden = false;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function buildSourceSummary(branches, suppliers, fallbackBranch) {
  const branchLabels = (branches || []).join(", ");
  const supplierLabels = (suppliers || []).map((supplier) => `SUP: ${supplier}`).join(", ");
  const fallbackLabel = fallbackBranch ? `Order If Out: ${fallbackBranch}` : "";
  return [branchLabels, fallbackLabel, supplierLabels].filter(Boolean).join(" | ");
}

function removeSupplierLabel(supplierToDelete) {
  const normalizedTarget = normalizeSupplierName(supplierToDelete);
  if (!normalizedTarget) {
    return;
  }

  if (!confirmDeleteAction(`supplier label ${normalizedTarget}`)) {
    return;
  }

  calculatorState.suppliers = calculatorState.suppliers.filter((supplier) => supplier !== normalizedTarget);
  calculatorState.customExternalSuppliers = calculatorState.customExternalSuppliers.filter((supplier) => supplier !== normalizedTarget);
  calculatorState.detailSelectedSuppliers = calculatorState.detailSelectedSuppliers.filter((supplier) => supplier !== normalizedTarget);

  calculatorState.customItems = calculatorState.customItems.map((item) => {
    const sourceData = normalizeItemSourceData(item);
    const suppliers = sourceData.suppliers.filter((supplier) => supplier !== normalizedTarget);
    return {
      ...item,
      sources: [
        ...sourceData.branches,
        ...suppliers.map((supplier) => `SUP: ${supplier}`),
      ],
    };
  });

  const updatedOverrides = {};
  Object.entries(calculatorState.itemOverrides).forEach(([itemId, override]) => {
    const sourceData = normalizeItemSourceData(override);
    const suppliers = sourceData.suppliers.filter((supplier) => supplier !== normalizedTarget);
    updatedOverrides[itemId] = {
      ...override,
      sources: [
        ...sourceData.branches,
        ...suppliers.map((supplier) => `SUP: ${supplier}`),
      ],
      sourcingBranch: buildSourceSummary(sourceData.branches, suppliers, sourceData.fallbackBranch),
    };
  });
  calculatorState.itemOverrides = updatedOverrides;
  markCatalogDirty();

  persistSuppliers();
  persistCustomItems();
  persistItemChanges();
  renderSourceControls();
  renderDetailSourceControls();
  renderResults();
  renderCustomItems();
}

function renderSourceControls() {
  elements.internalSourceOptions.innerHTML = INTERNAL_SOURCE_BRANCHES
    .map(
      (branch) => `
        <button
          class="source-option${calculatorState.customSelectedBranches.includes(branch) ? " is-active" : ""}"
          type="button"
          data-internal-branch="${escapeHtml(branch)}"
        >
          ${escapeHtml(branch)}
        </button>
      `
    )
    .join("");

  elements.customFallbackBranchSelect.innerHTML = `
    <option value="">Select fallback warehouse</option>
    ${INTERNAL_SOURCE_BRANCHES
      .filter((branch) => branch !== "STOCK")
      .map(
        (branch) => `<option value="${escapeHtml(branch)}"${calculatorState.customFallbackBranch === branch ? " selected" : ""}>${escapeHtml(branch)}</option>`
      )
      .join("")}
  `;

  if (calculatorState.suppliers.length === 0) {
    elements.externalSuppliersList.innerHTML = `<div class="calc-line calc-line--muted">No suppliers added yet.</div>`;
  } else {
    elements.externalSuppliersList.innerHTML = calculatorState.suppliers
      .map(
        (supplier) => `
          <div class="supplier-label-row">
            <button
              class="source-option${calculatorState.customExternalSuppliers.includes(supplier) ? " is-active" : ""}"
              type="button"
              data-supplier-option="${escapeHtml(supplier)}"
            >
              ${escapeHtml(`SUP: ${supplier}`)}
            </button>
            <button
              class="supplier-delete-button"
              type="button"
              data-delete-supplier="${escapeHtml(supplier)}"
              aria-label="Delete supplier label ${escapeHtml(supplier)}"
              title="Delete supplier label"
            >
              x
            </button>
          </div>
        `
      )
      .join("");
  }
}

function renderDetailSourceControls() {
  elements.detailBranchOptions.innerHTML = INTERNAL_SOURCE_BRANCHES
    .map(
      (branch) => `
        <button
          class="source-option${calculatorState.detailSelectedBranches.includes(branch) ? " is-active" : ""}"
          type="button"
          data-detail-branch="${escapeHtml(branch)}"
        >
          ${escapeHtml(branch)}
        </button>
      `
    )
    .join("");

  elements.detailFallbackBranchSelect.innerHTML = `
    <option value="">Select fallback warehouse</option>
    ${INTERNAL_SOURCE_BRANCHES
      .filter((branch) => branch !== "STOCK")
      .map(
        (branch) => `<option value="${escapeHtml(branch)}"${calculatorState.detailFallbackBranch === branch ? " selected" : ""}>${escapeHtml(branch)}</option>`
      )
      .join("")}
  `;

  if (calculatorState.suppliers.length === 0) {
    elements.detailSupplierOptions.innerHTML = `<div class="calc-line calc-line--muted">No suppliers added yet.</div>`;
  } else {
    elements.detailSupplierOptions.innerHTML = calculatorState.suppliers
      .map(
        (supplier) => `
          <div class="supplier-label-row">
            <button
              class="source-option${calculatorState.detailSelectedSuppliers.includes(supplier) ? " is-active" : ""}"
              type="button"
              data-detail-supplier="${escapeHtml(supplier)}"
            >
              ${escapeHtml(`SUP: ${supplier}`)}
            </button>
            <button
              class="supplier-delete-button"
              type="button"
              data-delete-supplier="${escapeHtml(supplier)}"
              aria-label="Delete supplier label ${escapeHtml(supplier)}"
              title="Delete supplier label"
            >
              x
            </button>
          </div>
        `
      )
      .join("");
  }

  elements.detailEditBranch.value = buildSourceSummary(
    calculatorState.detailSelectedBranches,
    calculatorState.detailSelectedSuppliers,
    calculatorState.detailFallbackBranch
  );
}

function renderColourOptions() {
  elements.colourSelect.innerHTML = COLOUR_PALETTE
    .map((entry) => `<option value="${entry.code}">${entry.name} (${entry.code})</option>`)
    .join("");
}

function renderColourSwatches() {
  elements.colourSwatches.innerHTML = COLOUR_PALETTE
    .map(
      (swatch) => `
        <button
          class="colour-swatch${calculatorState.colour === swatch.code ? " is-active" : ""}"
          type="button"
          data-colour-swatch="${escapeHtml(swatch.code)}"
          title="${escapeHtml(swatch.name)}"
        >
          <span class="colour-swatch__chip" style="background:${escapeHtml(swatch.hex)};"></span>
          <span class="colour-swatch__label">${escapeHtml(swatch.name)}</span>
        </button>
      `
    )
    .join("");

  elements.colourLegendList.innerHTML = COLOUR_PALETTE
    .map(
      (entry) => `
        <div class="supplier-label-row">
          <span class="colour-swatch__chip" style="background:${escapeHtml(entry.hex)};"></span>
          <span>${escapeHtml(entry.name)} (${escapeHtml(entry.code)})</span>
        </div>
      `
    )
    .join("");
}

function renderSides() {
  elements.sidesInput.value = calculatorState.sidesRaw;
}

function evaluateSidesExpression(rawValue) {
  const raw = String(rawValue || "").trim();
  if (!raw) {
    return { value: 0, display: "0", isValid: true };
  }

  const expression = raw.replace(/×/g, "*").replace(/÷/g, "/");
  if (!/^[0-9+\-*/().\s]+$/.test(expression) || !/[0-9]/.test(expression)) {
    return { value: 0, display: raw, isValid: false };
  }

  try {
    const result = Function(`"use strict"; return (${expression});`)();
    if (!Number.isFinite(result)) {
      return { value: 0, display: raw, isValid: false };
    }
    return { value: result, display: raw, isValid: true };
  } catch (error) {
    return { value: 0, display: raw, isValid: false };
  }
}

function formatCalculatorNumber(value) {
  if (!Number.isFinite(value)) {
    return "0";
  }
  return Number.isInteger(value) ? String(value) : Number(value.toFixed(2)).toString();
}

function appendSidesPadKey(key) {
  const current = calculatorState.sidesRaw || "";
  const compactCurrent = current.replace(/\s+/g, "");

  if (key === "clear") {
    calculatorState.sidesRaw = "";
    renderCalculator();
    return;
  }

  if (key === "backspace") {
    calculatorState.sidesRaw = current.slice(0, -1);
    renderCalculator();
    return;
  }

  const isOperator = ["+", "-", "*", "/"].includes(key);
  if (isOperator) {
    if (!compactCurrent && key !== "-") {
      return;
    }
    if (/[+\-*/.]$/.test(compactCurrent)) {
      calculatorState.sidesRaw = `${compactCurrent.slice(0, -1)}${key}`;
      renderCalculator();
      return;
    }
  }

  calculatorState.sidesRaw = `${compactCurrent}${key}`;
  renderCalculator();
}

function getCalculatorValues() {
  const sidesEvaluation = evaluateSidesExpression(calculatorState.sidesRaw);
  const totalSidesInput = sidesEvaluation.value;
  const standard = Number(calculatorState.standardFolds || 0);
  const crushFoldCountInput = Math.max(0, Math.floor(Number(calculatorState.crushReturn || 0)));
  const crushAllowance = crushFoldCountInput * 10;
  const crushFoldCount = crushFoldCountInput * 2;

  const totalFolds = standard + crushFoldCount;
  const totalSides = totalSidesInput + crushAllowance;
  const actualGirth = totalSides;

  let roundedGirth = Math.ceil(actualGirth / 100) * 100;
  if (roundedGirth === 1100) {
    roundedGirth = 1200;
  }

  const mainFolds = totalFolds > 6 ? 6 : totalFolds;
  const extraFolds = totalFolds > 6 ? totalFolds - 6 : 0;
  const sidesString = sidesEvaluation.display || "0";
  const crushParts = [];
  for (let index = 0; index < crushFoldCountInput; index += 1) {
    crushParts.push(`10 (Crush Fold ${index + 1})`);
  }
  const crushString = crushParts.join(" + ");
  const family = familyConfig[calculatorState.family];
  const colourSummary = family.usesColour ? calculatorState.colour : "COPPER";
  const girthLine = `${sidesString}${crushString ? ` + ${crushString}` : ""} = ${formatCalculatorNumber(actualGirth)} -> ${roundedGirth}${sidesEvaluation.isValid ? "" : " (invalid side expression)"}`;
  const actualGirthLine = `Actual Girth (before rounding): ${formatCalculatorNumber(actualGirth)} mm`;
  const summaryLine = `F:${totalFolds}${totalFolds > 6 ? ` (${mainFolds}+${extraFolds})` : ""} | ${family.label} | ${colourSummary}${calculatorState.isTapering ? " | TAPER" : ""} | Q:${calculatorState.qty} | L:${calculatorState.length}m`;
  const workbookMainCode = family.buildCode({
    girth: roundedGirth,
    folds: mainFolds,
    colour: calculatorState.colour,
  });
  const mainCode = `${workbookMainCode} ${calculatorState.qty} QTY AT ${calculatorState.length}M EACH`;
  const extraFoldCode = extraFolds > 0 ? `\nF${extraFolds}B ${calculatorState.qty} QTY AT ${calculatorState.length}M EACH` : "";
  const taperCode = calculatorState.isTapering ? `\nFTAP ${calculatorState.qty} QTY AT ${calculatorState.length}M EACH` : "";
  const finalOutput = mainCode + extraFoldCode + taperCode;
  const mainMatch = items.find((item) => item.sapCode === workbookMainCode);
  const extraMatch = extraFolds > 0 ? items.find((item) => item.sapCode === `F${extraFolds}B`) : null;
  const fallbackMatches = items
    .filter((item) =>
      item.category === "SRSC- FLASHINGS" &&
      item.itemGroup === family.itemGroup &&
      item.sapCode.startsWith(String(roundedGirth))
    )
    .slice(0, 6);

  return {
    girthLine,
    actualGirthLine,
    actualGirth,
    summaryLine,
    finalOutput,
    workbookMainCode,
    mainMatch,
    extraMatch,
    fallbackMatches,
  };
}

function renderCalculator() {
  renderSides();
  renderColourSwatches();
  const {
    girthLine,
    actualGirthLine,
    summaryLine,
    finalOutput,
    workbookMainCode,
    mainMatch,
    extraMatch,
    fallbackMatches,
  } = getCalculatorValues();

  elements.standardFoldsInput.value = calculatorState.standardFolds;
  elements.crushReturnInput.value = calculatorState.crushReturn;
  elements.familySelect.value = calculatorState.family;
  elements.colourSelect.value = calculatorState.colour;
  elements.colourField.hidden = !familyConfig[calculatorState.family].usesColour;
  elements.colourSwatchesField.hidden = !familyConfig[calculatorState.family].usesColour;
  elements.qtyInput.value = calculatorState.qtyRaw;
  elements.lengthInput.value = calculatorState.lengthRaw;
  elements.taperingCheckbox.checked = calculatorState.isTapering;
  elements.salesOrderInput.value = calculatorState.salesOrderNo;
  if (elements.warehouseInput) {
    elements.warehouseInput.value = calculatorState.warehouse;
  }
  elements.addToOrderButton.textContent = calculatorState.editingCurrentOrderIndex !== null ? "Save Flashing" : "Add to Order";
  elements.girthLine.textContent = girthLine;
  elements.actualGirthLine.textContent = actualGirthLine;
  elements.summaryLine.textContent = summaryLine;
  elements.finalOutput.textContent = finalOutput;

  if (mainMatch) {
    elements.matchResults.innerHTML = `
      <div class="match-card">
        <span class="match-card__label">Workbook Main Match</span>
        <div class="match-card__code">${escapeHtml(mainMatch.sapCode)}</div>
        <p>${escapeHtml(mainMatch.itemName)}</p>
      </div>
      ${
        extraMatch
          ? `<div class="match-card">
              <span class="match-card__label">Workbook Extra Fold Match</span>
              <div class="match-card__code">${escapeHtml(extraMatch.sapCode)}</div>
              <p>${escapeHtml(extraMatch.itemName)}</p>
            </div>`
          : ""
      }
    `;
  } else {
    elements.matchResults.innerHTML = `
      <div class="match-card">
        <span class="match-card__label">No Exact Workbook Match</span>
        <div class="match-card__code">${escapeHtml(workbookMainCode)}</div>
        <p>The generated code did not exactly match an imported flashing item. Nearby workbook candidates are shown below.</p>
      </div>
      ${fallbackMatches
        .map(
          (item) => `
            <div class="match-card">
              <span class="match-card__label">Closest Workbook Candidate</span>
              <div class="match-card__code">${escapeHtml(item.sapCode)}</div>
              <p>${escapeHtml(item.itemName)}</p>
            </div>
          `
        )
        .join("")}
    `;
  }

  renderCurrentOrder();
  renderOrdersToday();
}

async function copyCalculatorOutput() {
  const { girthLine, actualGirthLine, summaryLine, finalOutput } = getCalculatorValues();
  const text = `${girthLine}\n${actualGirthLine}\n${summaryLine}\n\n${finalOutput}`;

  try {
    await navigator.clipboard.writeText(text);
    elements.copyAllFeedback.textContent = "Calculation copied.";
  } catch (error) {
    elements.copyAllFeedback.textContent = "Clipboard copy failed on this device.";
  }
}

function renderCurrentOrder() {
  if (calculatorState.currentOrderItems.length === 0) {
    elements.currentOrderList.innerHTML = `<div class="calc-line calc-line--muted">No items added yet.</div>`;
    return;
  }

  elements.currentOrderList.innerHTML = calculatorState.currentOrderItems
    .map(
      (item, index) => `
        <div class="order-item">
          <div class="order-item__type">${escapeHtml(item.type)}</div>
          <div>${escapeHtml(item.girthLine)}</div>
          <div>${escapeHtml(item.actualGirthLine || (item.actualGirth ? `Actual Girth (before rounding): ${item.actualGirth} mm` : ""))}</div>
          <div>${escapeHtml(item.summaryLine)}</div>
          <div class="order-item__output">${escapeHtml(item.finalOutput)}</div>
          <div class="item-actions">
            <button class="ghost-button" type="button" data-edit-order-item="${index}">Edit</button>
            <button class="danger-button" type="button" data-delete-order-item="${index}">Delete</button>
          </div>
        </div>
      `
    )
    .join("");
}

function renderOrdersToday() {
  if (calculatorState.orders.length === 0) {
    elements.ordersTodayList.innerHTML = `<div class="calc-line calc-line--muted">No finalised orders yet.</div>`;
    return;
  }

  const getOrderItemDisplayText = (item) => {
    const finalOutput = String(item?.finalOutput || "").trim();
    if (finalOutput) {
      return finalOutput;
    }
    return [item?.summaryLine, item?.girthLine, item?.actualGirthLine]
      .filter(Boolean)
      .join("\n");
  };

  elements.ordersTodayList.innerHTML = calculatorState.orders
    .map(
      (order, index) => {
        const isExpanded = calculatorState.expandedOrderId === order.orderId;
        const isEditing = calculatorState.editingFinalizedOrderId === order.orderId;
        return `
        <div class="order-day-card">
          <div class="order-day-card__header">
            <button class="ghost-button" type="button" data-toggle-order="${order.orderId}" aria-expanded="${isExpanded ? "true" : "false"}">
              <span><strong>${index + 1}. SO: ${escapeHtml(order.salesOrderNo || "N/A")}</strong></span>
              <span>${isExpanded ? "Hide Codes" : "View Codes"}</span>
            </button>
            <div class="item-actions">
              <button class="ghost-button" type="button" data-edit-finalized-order="${order.orderId}">Edit</button>
              <button class="danger-button" type="button" data-delete-finalized-order="${order.orderId}">Delete</button>
            </div>
          </div>
          <div class="order-day-card__meta">${escapeHtml(order.timestamp || "")}</div>
          ${
            isEditing
              ? `<div class="order-day-card__details">
                  <label class="field-label" for="editFinalizedOrderNo-${order.orderId}">Sales Order No</label>
                  <input
                    id="editFinalizedOrderNo-${order.orderId}"
                    class="field-input"
                    type="text"
                    data-edit-so-input="${order.orderId}"
                    value="${escapeHtml(calculatorState.editingFinalizedOrderSalesOrderNo)}"
                  />
                  <div class="item-actions">
                    <button class="primary-button" type="button" data-save-finalized-order="${order.orderId}">Save</button>
                    <button class="ghost-button" type="button" data-cancel-finalized-order="true">Cancel</button>
                  </div>
                </div>`
              : ""
          }
          ${
            isExpanded
              ? `<div class="order-day-card__details">
                ${
                  Array.isArray(order.items) && order.items.length > 0
                    ? order.items
                        .map(
                          (item, itemIndex) => `
                            <div class="order-item">
                              <div class="order-item__type">Flashing ${itemIndex + 1}</div>
                              <div class="order-day-card__output">${escapeHtml(getOrderItemDisplayText(item) || "No code output saved.")}</div>
                            </div>
                          `
                        )
                        .join("")
                  : `<div class="calc-line calc-line--muted">No flashing codes saved for this order.</div>`
                }
              </div>`
              : ""
          }
        </div>
      `;
      }
    )
    .join("");
}

function renderCustomItems() {
  if (calculatorState.customItems.length === 0) {
    elements.customItemsList.innerHTML = `<div class="calc-line calc-line--muted">No saved custom items yet.</div>`;
    return;
  }

  elements.customItemsList.innerHTML = calculatorState.customItems
    .map((item) => {
      const sourceData = normalizeItemSourceData(item);
      const sourceSummary = buildSourceSummary(
        sourceData.branches,
        sourceData.suppliers,
        sourceData.fallbackBranch
      );

      return `
        <div class="order-item">
          <div>
            <strong>${escapeHtml(item.name)}</strong>
            ${item.preferred ? `<span class="preferred-badge">Preferred</span>` : ""}
          </div>
          <div class="order-item__output">${escapeHtml(item.code)}</div>
          <div class="order-item__type">Preferred Source Labels</div>
          <div>${escapeHtml(sourceSummary || "No labels selected")}</div>
          <p class="item-notes">${escapeHtml(item.notes || "")}</p>
          <div class="item-actions">
            <button class="ghost-button" type="button" data-edit-item-id="custom:${item.uid}">Edit</button>
            <button class="danger-button" type="button" data-delete-item-id="custom:${item.uid}">Delete</button>
          </div>
        </div>
      `;
    })
    .join("");
}

function resetFlashingForm() {
  calculatorState.sidesRaw = "";
  calculatorState.standardFolds = 0;
  calculatorState.crushReturn = 0;
  calculatorState.isTapering = false;
  calculatorState.family = "colorbond055";
  calculatorState.colour = "MON";
  calculatorState.qty = 1;
  calculatorState.qtyRaw = "1";
  calculatorState.length = 1;
  calculatorState.lengthRaw = "1";
  calculatorState.editingCurrentOrderIndex = null;
}

function loadFlashingIntoForm(orderItem, index) {
  if (!orderItem || !orderItem.calculatorInput) {
    return;
  }

  calculatorState.sidesRaw = orderItem.calculatorInput.sidesRaw || "";
  calculatorState.standardFolds = Number(orderItem.calculatorInput.standardFolds || 0);
  const legacyCrushReturns = Array.isArray(orderItem.calculatorInput.crushReturns)
    ? orderItem.calculatorInput.crushReturns
    : [];
  const legacyCrushCount = legacyCrushReturns.filter((value) => Number(value) > 0).length;
  calculatorState.crushReturn = Number(orderItem.calculatorInput.crushReturn || legacyCrushCount || 0);
  calculatorState.isTapering = Boolean(orderItem.calculatorInput.isTapering);
  calculatorState.family = orderItem.calculatorInput.family || "colorbond055";
  calculatorState.colour = orderItem.calculatorInput.colour || "MON";
  calculatorState.qty = Number(orderItem.calculatorInput.qty || 1);
  calculatorState.qtyRaw = String(orderItem.calculatorInput.qty || 1);
  calculatorState.length = Number(orderItem.calculatorInput.length || 1);
  calculatorState.lengthRaw = String(orderItem.calculatorInput.length || 1);
  calculatorState.editingCurrentOrderIndex = index;
  elements.copyAllFeedback.textContent = "Editing current order item.";
  renderCalculator();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function deleteCurrentOrderItem(index) {
  const item = calculatorState.currentOrderItems[index];
  if (!item) {
    return;
  }

  if (!confirmDeleteAction(`order item ${index + 1}`)) {
    return;
  }

  calculatorState.currentOrderItems = calculatorState.currentOrderItems.filter((_, itemIndex) => itemIndex !== index);
  if (calculatorState.editingCurrentOrderIndex === index) {
    resetFlashingForm();
  } else if (calculatorState.editingCurrentOrderIndex !== null && calculatorState.editingCurrentOrderIndex > index) {
    calculatorState.editingCurrentOrderIndex -= 1;
  }
  persistCurrentOrder();
  elements.copyAllFeedback.textContent = "Flashing deleted from current order.";
  renderCalculator();
}

function resetCustomItemForm() {
  calculatorState.editingCustomItemIndex = null;
  calculatorState.editingItemRef = null;
  calculatorState.customSelectedBranches = [];
  calculatorState.customExternalSuppliers = [];
  calculatorState.customFallbackBranch = "";
  elements.customNameInput.value = "";
  elements.customCodeInput.value = "";
  elements.customNotesInput.value = "";
  elements.customImageInput.value = "";
  calculatorState.customImageDataUrl = "";
  renderImagePreview(elements.customImagePreview, "", "");
  elements.customPreferredInput.checked = false;
  elements.externalSupplierInput.value = "";
  elements.customFormHeading.textContent = "New Lookup Item";
  elements.saveCustomItemButton.textContent = "Save Item";
  elements.cancelEditItemButton.hidden = true;
  renderSourceControls();
}

function startEditItem(itemId) {
  const item = getCatalogItems().find((entry) => entry.id === itemId);
  if (!item) {
    return;
  }

  calculatorState.editingItemRef = itemId;
  elements.customNameInput.value = item.itemName || item.name || "";
  elements.customCodeInput.value = item.sapCode || item.code || "";
  elements.customNotesInput.value = item.itemDescription || item.notes || "";
  calculatorState.customImageDataUrl = item.imageUrl || "";
  elements.customImageInput.value = "";
  renderImagePreview(elements.customImagePreview, calculatorState.customImageDataUrl, item.itemName || item.name || "");
  elements.customPreferredInput.checked = Boolean(item.preferred);
  const sourceData = normalizeItemSourceData(item);
  calculatorState.customSelectedBranches = sourceData.branches;
  calculatorState.customExternalSuppliers = sourceData.suppliers;
  calculatorState.customFallbackBranch = sourceData.fallbackBranch;
  elements.customFormHeading.textContent = "Edit Lookup Item";
  elements.saveCustomItemButton.textContent = "Save Changes";
  elements.cancelEditItemButton.hidden = false;
  elements.customSaveFeedback.textContent = "";
  renderSourceControls();
  window.scrollTo({ top: 0, behavior: "smooth" });
  showAddItem();
}

function deleteItem(itemId) {
  const item = getCatalogItems().find((entry) => entry.id === itemId);
  if (!item) {
    return;
  }

  if (!confirmDeleteAction(item.itemName || item.name || item.sapCode || "item")) {
    return;
  }

  if (itemId.startsWith("custom:")) {
    const uid = itemId.replace("custom:", "");
    calculatorState.customItems = calculatorState.customItems.filter((entry) => entry.uid !== uid);
    persistCustomItems();
  } else {
    if (!calculatorState.deletedItems.includes(itemId)) {
      calculatorState.deletedItems = [...calculatorState.deletedItems, itemId];
    }
    persistItemChanges();
  }
  if (calculatorState.editingItemRef === itemId) {
    resetCustomItemForm();
  }
  markCatalogDirty();
  closeDetail();
  elements.customSaveFeedback.textContent = `${item.itemName || item.name} deleted.`;
  renderCustomItems();
  renderResults();
}

function addToOrder() {
  const { girthLine, actualGirthLine, actualGirth, summaryLine, finalOutput } = getCalculatorValues();
  const item = {
    type: "Flashing",
    girthLine,
    actualGirthLine,
    actualGirth,
    summaryLine,
    finalOutput,
    calculatorInput: {
      sidesRaw: calculatorState.sidesRaw,
      standardFolds: calculatorState.standardFolds,
      crushReturn: calculatorState.crushReturn,
      isTapering: calculatorState.isTapering,
      family: calculatorState.family,
      colour: calculatorState.colour,
      qty: calculatorState.qty,
      length: calculatorState.length,
    },
  };

  if (calculatorState.editingCurrentOrderIndex !== null) {
    calculatorState.currentOrderItems = calculatorState.currentOrderItems.map((entry, index) =>
      index === calculatorState.editingCurrentOrderIndex ? item : entry
    );
    elements.copyAllFeedback.textContent = "Flashing updated and form cleared for next flashing.";
  } else {
    calculatorState.currentOrderItems = [...calculatorState.currentOrderItems, item];
    elements.copyAllFeedback.textContent = "Item added and form cleared for next flashing.";
  }
  persistCurrentOrder();
  resetFlashingForm();
  renderCalculator();
}

function finalizeOrder() {
  if (calculatorState.currentOrderItems.length === 0) {
    elements.copyAllFeedback.textContent = "Add at least one item before finalising.";
    return;
  }
  if (!calculatorState.salesOrderNo.trim()) {
    elements.copyAllFeedback.textContent = "Enter Sales Order No before finalising.";
    return;
  }

  const printableOrder = {
    orderId: calculatorState.orderCounter,
    salesOrderNo: calculatorState.salesOrderNo,
    items: calculatorState.currentOrderItems,
    timestamp: new Date().toLocaleString(),
  };

  const orderSummary = {
    orderId: calculatorState.orderCounter,
    salesOrderNo: calculatorState.salesOrderNo,
    timestamp: printableOrder.timestamp,
    items: printableOrder.items.map((item) => ({
      finalOutput: String(item?.finalOutput || ""),
      summaryLine: String(item?.summaryLine || ""),
      girthLine: String(item?.girthLine || ""),
      actualGirthLine: String(item?.actualGirthLine || ""),
    })),
  };

  calculatorState.orders = [...calculatorState.orders, orderSummary];
  calculatorState.expandedOrderId = orderSummary.orderId;
  calculatorState.editingFinalizedOrderId = null;
  calculatorState.editingFinalizedOrderSalesOrderNo = "";
  calculatorState.currentOrderItems = [];
  calculatorState.salesOrderNo = "";
  calculatorState.warehouse = "";
  calculatorState.orderCounter += 1;
  persistOrders();
  persistCurrentOrder();
  downloadOrderJson(printableOrder);
  elements.copyAllFeedback.textContent = `Sales order ${orderSummary.salesOrderNo} finalised.`;
  renderCalculator();
}

function startEditFinalizedOrder(orderId) {
  const order = calculatorState.orders.find((entry) => entry.orderId === orderId);
  if (!order) {
    return;
  }

  calculatorState.editingFinalizedOrderId = orderId;
  calculatorState.editingFinalizedOrderSalesOrderNo = String(order.salesOrderNo || "");
  calculatorState.expandedOrderId = orderId;
  renderOrdersToday();
}

function saveFinalizedOrder(orderId) {
  const nextSalesOrderNo = calculatorState.editingFinalizedOrderSalesOrderNo.trim();
  if (!nextSalesOrderNo) {
    elements.copyAllFeedback.textContent = "Sales Order No cannot be blank.";
    return;
  }

  calculatorState.orders = calculatorState.orders.map((order) =>
    order.orderId === orderId
      ? { ...order, salesOrderNo: nextSalesOrderNo }
      : order
  );
  calculatorState.editingFinalizedOrderId = null;
  calculatorState.editingFinalizedOrderSalesOrderNo = "";
  persistOrders();
  elements.copyAllFeedback.textContent = `Sales order updated to ${nextSalesOrderNo}.`;
  renderOrdersToday();
}

function cancelEditFinalizedOrder() {
  calculatorState.editingFinalizedOrderId = null;
  calculatorState.editingFinalizedOrderSalesOrderNo = "";
  renderOrdersToday();
}

function deleteFinalizedOrder(orderId) {
  const order = calculatorState.orders.find((entry) => entry.orderId === orderId);
  if (!order) {
    return;
  }

  if (!confirmDeleteAction(`sales order ${order.salesOrderNo || order.orderId}`)) {
    return;
  }

  calculatorState.orders = calculatorState.orders.filter((entry) => entry.orderId !== orderId);
  if (calculatorState.expandedOrderId === orderId) {
    calculatorState.expandedOrderId = null;
  }
  if (calculatorState.editingFinalizedOrderId === orderId) {
    calculatorState.editingFinalizedOrderId = null;
    calculatorState.editingFinalizedOrderSalesOrderNo = "";
  }
  persistOrders();
  elements.copyAllFeedback.textContent = `Sales order ${order.salesOrderNo || order.orderId} deleted.`;
  renderOrdersToday();
}

function downloadOrderJson(order) {
  const fileSafeOrderNumber = String(order.salesOrderNo || `order-${order.orderId}`)
    .replace(/[\\/:*?"<>|]+/g, "-")
    .trim();
  const filename = `${fileSafeOrderNumber || `order-${order.orderId}`}.json`;
  const payload = JSON.stringify(order, null, 2);
  const blob = new Blob([payload], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(link.href);
}

async function copySingleOrder(orderId) {
  const order = calculatorState.orders.find((entry) => entry.orderId === orderId);
  if (!order) {
    return;
  }

  const text = order.items
    .map((item) => `${item.girthLine}\n${item.summaryLine}\n${item.finalOutput}`)
    .join("\n\n");

  try {
    await navigator.clipboard.writeText(`Order #${order.orderId}\nSO: ${order.salesOrderNo || ""}\nWarehouse: ${order.warehouse || ""}\n\n${text}`);
    elements.copyAllFeedback.textContent = `Order #${order.orderId} copied.`;
  } catch (error) {
    elements.copyAllFeedback.textContent = "Clipboard copy failed on this device.";
  }
}

function saveCustomItem() {
  const name = elements.customNameInput.value.trim();
  const code = elements.customCodeInput.value.trim();
  const notes = elements.customNotesInput.value.trim();
  const preferred = elements.customPreferredInput.checked;
  const sources = [
    ...calculatorState.customSelectedBranches,
    ...calculatorState.customExternalSuppliers.map((supplier) => `SUP: ${supplier}`),
  ];

  if (!name || !code) {
    elements.customSaveFeedback.textContent = "Enter the required item name and code.";
    return;
  }

  if (sources.length === 0) {
    elements.customSaveFeedback.textContent = "Select at least one source branch or supplier.";
    return;
  }

  const itemPayload = { name, code, notes, preferred, sources, imageUrl: calculatorState.customImageDataUrl };
  if (calculatorState.editingItemRef && calculatorState.editingItemRef.startsWith("custom:")) {
    const uid = calculatorState.editingItemRef.replace("custom:", "");
    calculatorState.customItems = calculatorState.customItems.map((item) =>
      item.uid === uid
        ? { ...item, ...itemPayload, fallbackBranch: calculatorState.customFallbackBranch }
        : item
    );
  } else if (calculatorState.editingItemRef && calculatorState.editingItemRef.startsWith("base:")) {
    calculatorState.itemOverrides[calculatorState.editingItemRef] = {
      itemName: name,
      sapCode: code,
      itemDescription: notes,
      preferred,
      sources,
      fallbackBranch: calculatorState.customFallbackBranch,
      sourcingBranch: buildSourceSummary(
        calculatorState.customSelectedBranches,
        calculatorState.customExternalSuppliers,
        calculatorState.customFallbackBranch
      ),
      imageUrl: calculatorState.customImageDataUrl,
    };
    calculatorState.deletedItems = calculatorState.deletedItems.filter((entry) => entry !== calculatorState.editingItemRef);
    persistItemChanges();
  } else {
    calculatorState.customItems = [
      ...calculatorState.customItems,
      {
        uid: `custom-${Date.now()}`,
        ...itemPayload,
        fallbackBranch: calculatorState.customFallbackBranch,
      },
    ];
  }
  persistCustomItems();

  elements.customSaveFeedback.textContent = calculatorState.editingItemRef ? "Changes saved." : "Saved.";
  resetCustomItemForm();
  markCatalogDirty();
  renderCustomItems();
  renderResults();
}

elements.searchInput.addEventListener("input", (event) => {
  state.searchTerm = event.target.value;
  renderResults();
});

elements.filterButton?.addEventListener("click", openSheet);
elements.sideHomeButton.addEventListener("click", () => {
  closeDetail();
  closeSheet();
  showFinder();
});
elements.sideFilterButton.addEventListener("click", openSheet);
elements.sideAboutButton.addEventListener("click", () => {
  closeDetail();
  closeSheet();
  showAbout();
});
elements.clearFiltersButton.addEventListener("click", clearFilters);
elements.backButton.addEventListener("click", closeDetail);
elements.copySapButton.addEventListener("click", copySapCode);
elements.detailPreferredCheckbox.addEventListener("change", (event) => {
  if (!state.selectedItemId) {
    return;
  }

  updateItemPreferred(state.selectedItemId, event.target.checked);
  openDetail(state.selectedItemId);
  elements.copyFeedback.textContent = event.target.checked
    ? "Preferred code saved for this item."
    : "Preferred code removed for this item.";
});
elements.editDetailItemButton.addEventListener("click", startDetailEdit);
elements.saveDetailItemButton.addEventListener("click", saveDetailItem);
elements.cancelDetailEditButton.addEventListener("click", cancelDetailEdit);
elements.deleteDetailItemButton.addEventListener("click", () => {
  if (!state.selectedItemId) {
    return;
  }
  deleteItem(state.selectedItemId);
});
elements.floatingCalculatorButton.addEventListener("click", showCalculator);
elements.floatingAddItemButton.addEventListener("click", showAddItem);
elements.calculatorBackButton.addEventListener("click", showFinder);
elements.addItemBackButton.addEventListener("click", showFinder);
elements.aboutBackButton.addEventListener("click", showFinder);
elements.addToOrderButton.addEventListener("click", addToOrder);
elements.clearFlashingButton.addEventListener("click", () => {
  resetFlashingForm();
  elements.copyAllFeedback.textContent = "Flashing fields cleared.";
  renderCalculator();
});
elements.finalizeOrderButton.addEventListener("click", finalizeOrder);
elements.copyAllButton.addEventListener("click", copyCalculatorOutput);
elements.saveCustomItemButton.addEventListener("click", saveCustomItem);
elements.cancelEditItemButton.addEventListener("click", () => {
  resetCustomItemForm();
  elements.customSaveFeedback.textContent = "Edit cancelled.";
});
elements.customImageInput.addEventListener("change", async (event) => {
  const file = event.target.files?.[0];
  if (!file) {
    return;
  }

  try {
    calculatorState.customImageDataUrl = await readFileAsDataUrl(file);
    renderImagePreview(elements.customImagePreview, calculatorState.customImageDataUrl, elements.customNameInput.value || "Custom item");
  } catch (error) {
    elements.customSaveFeedback.textContent = "Image upload failed.";
  }
});
elements.internalSourceOptions.addEventListener("click", (event) => {
  const button = event.target.closest("[data-internal-branch]");
  if (!button) {
    return;
  }

  const branch = button.getAttribute("data-internal-branch");
  if (calculatorState.customSelectedBranches.includes(branch)) {
    calculatorState.customSelectedBranches = calculatorState.customSelectedBranches.filter((value) => value !== branch);
  } else {
    calculatorState.customSelectedBranches = [...calculatorState.customSelectedBranches, branch];
  }
  renderSourceControls();
});
elements.externalSuppliersList.addEventListener("click", (event) => {
  const deleteButton = event.target.closest("[data-delete-supplier]");
  if (deleteButton) {
    removeSupplierLabel(deleteButton.getAttribute("data-delete-supplier"));
    return;
  }

  const button = event.target.closest("[data-supplier-option]");
  if (!button) {
    return;
  }

  const supplier = button.getAttribute("data-supplier-option");
  if (calculatorState.customExternalSuppliers.includes(supplier)) {
    calculatorState.customExternalSuppliers = calculatorState.customExternalSuppliers.filter((value) => value !== supplier);
  } else {
    calculatorState.customExternalSuppliers = [...calculatorState.customExternalSuppliers, supplier];
  }
  renderSourceControls();
});
elements.customFallbackBranchSelect.addEventListener("change", (event) => {
  calculatorState.customFallbackBranch = event.target.value;
  renderSourceControls();
});
elements.addExternalSupplierButton.addEventListener("click", () => {
  const supplier = normalizeSupplierName(elements.externalSupplierInput.value);
  if (!supplier) {
    return;
  }

  if (!calculatorState.suppliers.includes(supplier)) {
    calculatorState.suppliers = [...calculatorState.suppliers, supplier];
    persistSuppliers();
  }
  if (!calculatorState.customExternalSuppliers.includes(supplier)) {
    calculatorState.customExternalSuppliers = [...calculatorState.customExternalSuppliers, supplier];
  }
  elements.externalSupplierInput.value = "";
  renderSourceControls();
});
elements.detailBranchOptions.addEventListener("click", (event) => {
  const button = event.target.closest("[data-detail-branch]");
  if (!button) {
    return;
  }

  const branch = button.getAttribute("data-detail-branch");
  if (calculatorState.detailSelectedBranches.includes(branch)) {
    calculatorState.detailSelectedBranches = calculatorState.detailSelectedBranches.filter((value) => value !== branch);
  } else {
    calculatorState.detailSelectedBranches = [...calculatorState.detailSelectedBranches, branch];
  }
  renderDetailSourceControls();
});
elements.detailSupplierOptions.addEventListener("click", (event) => {
  const deleteButton = event.target.closest("[data-delete-supplier]");
  if (deleteButton) {
    removeSupplierLabel(deleteButton.getAttribute("data-delete-supplier"));
    return;
  }

  const button = event.target.closest("[data-detail-supplier]");
  if (!button) {
    return;
  }

  const supplier = button.getAttribute("data-detail-supplier");
  if (calculatorState.detailSelectedSuppliers.includes(supplier)) {
    calculatorState.detailSelectedSuppliers = calculatorState.detailSelectedSuppliers.filter((value) => value !== supplier);
  } else {
    calculatorState.detailSelectedSuppliers = [...calculatorState.detailSelectedSuppliers, supplier];
  }
  renderDetailSourceControls();
});
elements.detailFallbackBranchSelect.addEventListener("change", (event) => {
  calculatorState.detailFallbackBranch = event.target.value;
  renderDetailSourceControls();
});
elements.detailAddSupplierButton.addEventListener("click", () => {
  const supplier = normalizeSupplierName(elements.detailSupplierInput.value);
  if (!supplier) {
    return;
  }

  if (!calculatorState.suppliers.includes(supplier)) {
    calculatorState.suppliers = [...calculatorState.suppliers, supplier];
    persistSuppliers();
  }
  if (!calculatorState.detailSelectedSuppliers.includes(supplier)) {
    calculatorState.detailSelectedSuppliers = [...calculatorState.detailSelectedSuppliers, supplier];
  }
  elements.detailSupplierInput.value = "";
  renderDetailSourceControls();
  renderSourceControls();
});
elements.detailImageInput.addEventListener("change", async (event) => {
  const file = event.target.files?.[0];
  if (!file) {
    return;
  }

  try {
    calculatorState.detailImageDataUrl = await readFileAsDataUrl(file);
    renderImagePreview(elements.detailImagePreview, calculatorState.detailImageDataUrl, elements.detailEditName.value || "Item image");
  } catch (error) {
    elements.copyFeedback.textContent = "Image upload failed.";
  }
});

elements.filterSheet.addEventListener("click", (event) => {
  const closeTarget = event.target.closest("[data-close-sheet='true']");
  const branchTarget = event.target.closest("[data-branch]");

  if (closeTarget) {
    closeSheet();
    return;
  }

  if (branchTarget) {
    state.selectedBranch = branchTarget.getAttribute("data-branch") || "All";
    renderBranchOptions();
    renderResults();
    closeSheet();
  }
});

elements.resultsList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-item-id]");
  if (!button) {
    return;
  }

  openDetail(button.getAttribute("data-item-id"));
});

elements.sidesInput.addEventListener("input", (event) => {
  calculatorState.sidesRaw = event.target.value;
  renderCalculator();
});

elements.sidesPad.addEventListener("click", (event) => {
  const button = event.target.closest("[data-pad-key]");
  if (!button) {
    return;
  }
  appendSidesPadKey(button.getAttribute("data-pad-key") || "");
});

elements.standardFoldsInput.addEventListener("input", (event) => {
  calculatorState.standardFolds = Number(event.target.value || 0);
  renderCalculator();
});

elements.crushReturnInput.addEventListener("input", (event) => {
  calculatorState.crushReturn = Number(event.target.value || 0);
  renderCalculator();
});

elements.familySelect.addEventListener("change", (event) => {
  calculatorState.family = event.target.value;
  renderCalculator();
});

elements.colourSelect.addEventListener("change", (event) => {
  calculatorState.colour = event.target.value;
  renderCalculator();
});

elements.colourSwatches.addEventListener("click", (event) => {
  const button = event.target.closest("[data-colour-swatch]");
  if (!button) {
    return;
  }

  calculatorState.colour = button.getAttribute("data-colour-swatch") || "MON";
  renderCalculator();
});

elements.qtyInput.addEventListener("input", (event) => {
  const sanitized = sanitizeDecimalRawInput(event.target.value);
  calculatorState.qtyRaw = sanitized;
  calculatorState.qty = parseDecimalInput(sanitized, calculatorState.qty);
  renderCalculator();
});

elements.lengthInput.addEventListener("input", (event) => {
  const sanitized = sanitizeDecimalRawInput(event.target.value);
  calculatorState.lengthRaw = sanitized;
  calculatorState.length = parseDecimalInput(sanitized, calculatorState.length);
  renderCalculator();
});

elements.taperingCheckbox.addEventListener("change", (event) => {
  calculatorState.isTapering = event.target.checked;
  renderCalculator();
});

elements.salesOrderInput.addEventListener("input", (event) => {
  calculatorState.salesOrderNo = event.target.value;
  persistCurrentOrder();
});

if (elements.warehouseInput) {
  elements.warehouseInput.addEventListener("input", (event) => {
    calculatorState.warehouse = event.target.value;
    persistCurrentOrder();
  });
}

elements.currentOrderList.addEventListener("click", (event) => {
  const editButton = event.target.closest("[data-edit-order-item]");
  if (editButton) {
    loadFlashingIntoForm(
      calculatorState.currentOrderItems[Number(editButton.getAttribute("data-edit-order-item"))],
      Number(editButton.getAttribute("data-edit-order-item"))
    );
    return;
  }

  const deleteButton = event.target.closest("[data-delete-order-item]");
  if (deleteButton) {
    deleteCurrentOrderItem(Number(deleteButton.getAttribute("data-delete-order-item")));
  }
});

elements.ordersTodayList.addEventListener("click", (event) => {
  const editButton = event.target.closest("[data-edit-finalized-order]");
  if (editButton) {
    startEditFinalizedOrder(Number(editButton.getAttribute("data-edit-finalized-order")));
    return;
  }

  const deleteButton = event.target.closest("[data-delete-finalized-order]");
  if (deleteButton) {
    deleteFinalizedOrder(Number(deleteButton.getAttribute("data-delete-finalized-order")));
    return;
  }

  const saveButton = event.target.closest("[data-save-finalized-order]");
  if (saveButton) {
    saveFinalizedOrder(Number(saveButton.getAttribute("data-save-finalized-order")));
    return;
  }

  const cancelButton = event.target.closest("[data-cancel-finalized-order]");
  if (cancelButton) {
    cancelEditFinalizedOrder();
    return;
  }

  const button = event.target.closest("[data-toggle-order]");
  if (!button) {
    return;
  }

  const orderId = Number(button.getAttribute("data-toggle-order"));
  calculatorState.expandedOrderId = calculatorState.expandedOrderId === orderId ? null : orderId;
  renderOrdersToday();
});

elements.ordersTodayList.addEventListener("input", (event) => {
  const input = event.target.closest("[data-edit-so-input]");
  if (!input) {
    return;
  }
  calculatorState.editingFinalizedOrderSalesOrderNo = input.value;
});

elements.customItemsList.addEventListener("click", (event) => {
  const editButton = event.target.closest("[data-edit-item-id]");
  if (editButton) {
    startEditItem(editButton.getAttribute("data-edit-item-id"));
    return;
  }

  const deleteButton = event.target.closest("[data-delete-item-id]");
  if (deleteButton) {
    deleteItem(deleteButton.getAttribute("data-delete-item-id"));
  }
});

elements.detailScreen.addEventListener("click", (event) => {
  if (event.target === elements.detailScreen) {
    closeDetail();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeSheet();
    closeDetail();
  }
});

renderColourOptions();
loadPersistedState();
renderBranchOptions();
renderResults();
renderCalculator();
setActiveView("finder");

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => {
        registration.unregister();
      });
    }).catch(() => {});
    if ("caches" in window) {
      caches.keys().then((keys) => {
        keys.forEach((key) => caches.delete(key));
      }).catch(() => {});
    }
  });
}

/* =========================================================
   AUTOLUX - COMMON JAVASCRIPT
   Car Accessories Store + Workshop + EV Support
   ========================================================= */

"use strict";

/* =========================================================
   1. AUTOLUX STORAGE KEYS
   ========================================================= */

const AUTO_LUX_STORAGE = {
    cart: "autoluxCart",
    wishlist: "autoluxWishlist",
    compare: "autoluxCompare",
    user: "autoluxUser",
    vehicle: "autoluxVehicle",
    workshop: "autoluxWorkshop",
    bookings: "autoluxBookings"
};


/* =========================================================
   2. SAFE LOCAL STORAGE FUNCTIONS
   ========================================================= */

function getStorage(key, defaultValue = []) {
    try {
        const value = localStorage.getItem(key);

        if (!value) {
            return defaultValue;
        }

        return JSON.parse(value);
    } catch (error) {
        console.warn("AutoLux Storage Error:", error);
        return defaultValue;
    }
}


function setStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.warn("AutoLux Storage Save Error:", error);
        return false;
    }
}


/* =========================================================
   3. CART SYSTEM
   ========================================================= */

function getCart() {
    return getStorage(AUTO_LUX_STORAGE.cart, []);
}


function saveCart(cart) {
    setStorage(AUTO_LUX_STORAGE.cart, cart);
    updateCartBadge();
}


function addToCart(product) {

    if (!product || !product.name) {
        showToast("Unable to add this product.", "error");
        return;
    }

    const cart = getCart();

    const productId =
        product.id ||
        product.name.toLowerCase().replace(/\s+/g, "-");

    const existingProduct = cart.find(
        item => item.id === productId
    );

    if (existingProduct) {

        existingProduct.quantity =
            Number(existingProduct.quantity || 1) + 1;

    } else {

        cart.push({
            id: productId,
            name: product.name,
            price: Number(product.price || 0),
            image: product.image || "",
            category: product.category || "Accessories",
            quantity: Number(product.quantity || 1),
            installation:
                product.installation === true ||
                product.installation === "true",
            evCompatible:
                product.evCompatible === true ||
                product.evCompatible === "true"
        });
    }

    saveCart(cart);

    showToast(
        `${product.name} added to your cart.`,
        "success"
    );
}


function removeFromCart(productId) {

    let cart = getCart();

    cart = cart.filter(item => item.id !== productId);

    saveCart(cart);

    renderCartIfPresent();

    showToast("Product removed from cart.", "success");
}


function changeCartQuantity(productId, change) {

    const cart = getCart();

    const product = cart.find(
        item => item.id === productId
    );

    if (!product) return;

    product.quantity =
        Number(product.quantity || 1) + Number(change);

    if (product.quantity <= 0) {
        removeFromCart(productId);
        return;
    }

    saveCart(cart);

    renderCartIfPresent();
}


function clearCart() {

    localStorage.removeItem(
        AUTO_LUX_STORAGE.cart
    );

    updateCartBadge();
    renderCartIfPresent();
}


/* =========================================================
   4. CART TOTAL
   ========================================================= */

function getCartSubtotal() {

    const cart = getCart();

    return cart.reduce(
        (total, item) =>
            total +
            Number(item.price || 0) *
            Number(item.quantity || 1),
        0
    );
}


function formatCurrency(amount) {

    return new Intl.NumberFormat(
        "en-IN",
        {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0
        }
    ).format(Number(amount || 0));
}


/* =========================================================
   5. CART BADGE
   ========================================================= */

function updateCartBadge() {

    const cart = getCart();

    const count = cart.reduce(
        (total, item) =>
            total + Number(item.quantity || 1),
        0
    );

    const badges = document.querySelectorAll(
        ".cart-count, #cartCount, [data-cart-count]"
    );

    badges.forEach(badge => {

        badge.textContent = count;

        badge.style.display =
            count > 0 ? "inline-flex" : "none";

    });
}


/* =========================================================
   6. RENDER CART PAGE
   ========================================================= */

function renderCartIfPresent() {

    const cartContainer =
        document.querySelector(
            "#cartItems, .cart-items, [data-cart-items]"
        );

    if (!cartContainer) return;

    const cart = getCart();

    if (cart.length === 0) {

        cartContainer.innerHTML = `
            <div class="empty-cart">
                <div style="font-size:60px;">🛒</div>

                <h2>Your cart is empty</h2>

                <p>
                    Discover premium accessories
                    for your vehicle.
                </p>

                <a href="accessories.html"
                   class="btn btn-primary">
                    Explore Accessories
                </a>
            </div>
        `;

        updateCartTotals();
        return;
    }


    cartContainer.innerHTML = cart.map(item => {

        const subtotal =
            Number(item.price || 0) *
            Number(item.quantity || 1);

        return `
            <div class="cart-item"
                 data-cart-product="${item.id}">

                <div class="cart-product-image">

                    <img src="${item.image ||
                        "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=400&q=80"}"
                         alt="${item.name}">

                </div>


                <div class="cart-product-info">

                    <h3>${item.name}</h3>

                    <p>${item.category}</p>

                    <strong>
                        ${formatCurrency(item.price)}
                    </strong>

                </div>


                <div class="cart-quantity">

                    <button
                        onclick="changeCartQuantity('${item.id}', -1)">
                        −
                    </button>

                    <span>
                        ${item.quantity}
                    </span>

                    <button
                        onclick="changeCartQuantity('${item.id}', 1)">
                        +
                    </button>

                </div>


                <div class="cart-product-total">

                    <strong>
                        ${formatCurrency(subtotal)}
                    </strong>

                    <button
                        class="remove-cart"
                        onclick="removeFromCart('${item.id}')">
                        Remove
                    </button>

                </div>

            </div>
        `;

    }).join("");

    updateCartTotals();
}


/* =========================================================
   7. UPDATE CART TOTALS
   ========================================================= */

function updateCartTotals() {

    const subtotal = getCartSubtotal();

    const subtotalElements =
        document.querySelectorAll(
            "#cartSubtotal, [data-cart-subtotal]"
        );

    subtotalElements.forEach(el => {
        el.textContent =
            formatCurrency(subtotal);
    });


    const totalElements =
        document.querySelectorAll(
            "#cartTotal, [data-cart-total]"
        );

    totalElements.forEach(el => {
        el.textContent =
            formatCurrency(subtotal);
    });
}


/* =========================================================
   8. WISHLIST
   ========================================================= */

function getWishlist() {
    return getStorage(
        AUTO_LUX_STORAGE.wishlist,
        []
    );
}


function isWishlisted(productId) {

    const wishlist = getWishlist();

    return wishlist.includes(productId);
}


function toggleWishlist(productId) {

    if (!productId) return;

    let wishlist = getWishlist();

    if (wishlist.includes(productId)) {

        wishlist =
            wishlist.filter(id => id !== productId);

        showToast(
            "Removed from wishlist.",
            "success"
        );

    } else {

        wishlist.push(productId);

        showToast(
            "Added to wishlist ❤️",
            "success"
        );
    }

    setStorage(
        AUTO_LUX_STORAGE.wishlist,
        wishlist
    );

    updateWishlistButtons();
}


function updateWishlistButtons() {

    const buttons =
        document.querySelectorAll(
            "[data-wishlist]"
        );

    buttons.forEach(button => {

        const id =
            button.dataset.wishlist;

        if (isWishlisted(id)) {

            button.classList.add("active");

            button.innerHTML =
                "♥";

            button.title =
                "Remove from Wishlist";

        } else {

            button.classList.remove("active");

            button.innerHTML =
                "♡";

            button.title =
                "Add to Wishlist";
        }

    });
}


/* =========================================================
   9. COMPARE SYSTEM
   ========================================================= */

function getCompare() {

    return getStorage(
        AUTO_LUX_STORAGE.compare,
        []
    );
}


function addToCompare(product) {

    if (!product || !product.id) {
        showToast(
            "Product information unavailable.",
            "error"
        );
        return;
    }

    let compare = getCompare();

    if (
        compare.some(
            item => item.id === product.id
        )
    ) {

        showToast(
            "This product is already in Compare.",
            "error"
        );

        return;
    }


    if (compare.length >= 3) {

        showToast(
            "You can compare up to 3 products.",
            "error"
        );

        return;
    }


    compare.push(product);

    setStorage(
        AUTO_LUX_STORAGE.compare,
        compare
    );

    updateCompareCount();

    showToast(
        `${product.name} added to Compare.`,
        "success"
    );
}


function removeFromCompare(productId) {

    let compare = getCompare();

    compare = compare.filter(
        item => item.id !== productId
    );

    setStorage(
        AUTO_LUX_STORAGE.compare,
        compare
    );

    updateCompareCount();

    showToast(
        "Removed from Compare.",
        "success"
    );
}


function clearCompare() {

    localStorage.removeItem(
        AUTO_LUX_STORAGE.compare
    );

    updateCompareCount();
}


function updateCompareCount() {

    const count =
        getCompare().length;

    const elements =
        document.querySelectorAll(
            ".compare-count, #compareCount, [data-compare-count]"
        );

    elements.forEach(el => {

        el.textContent = count;

        el.style.display =
            count > 0 ? "inline-flex" : "none";

    });
}


/* =========================================================
   10. VEHICLE SELECTION
   ========================================================= */

function saveVehicle(vehicle) {

    if (!vehicle) return;

    setStorage(
        AUTO_LUX_STORAGE.vehicle,
        vehicle
    );

    updateVehicleUI();

    showToast(
        "Vehicle selected successfully 🚗",
        "success"
    );
}


function getVehicle() {

    return getStorage(
        AUTO_LUX_STORAGE.vehicle,
        null
    );
}


function updateVehicleUI() {

    const vehicle = getVehicle();

    if (!vehicle) return;


    const elements =
        document.querySelectorAll(
            "[data-selected-vehicle]"
        );


    elements.forEach(el => {

        el.textContent =
            `${vehicle.brand || ""} ${vehicle.model || ""} ${vehicle.year || ""}`
                .trim();

    });
}


/* =========================================================
   11. WORKSHOP SELECTION
   ========================================================= */

function saveWorkshop(workshop) {

    if (!workshop) return;

    setStorage(
        AUTO_LUX_STORAGE.workshop,
        workshop
    );

    showToast(
        `${workshop.name || "Workshop"} selected.`,
        "success"
    );
}


function getWorkshop() {

    return getStorage(
        AUTO_LUX_STORAGE.workshop,
        null
    );
}


function selectWorkshopGlobal(workshop) {

    saveWorkshop(workshop);

    const workshopElements =
        document.querySelectorAll(
            "[data-selected-workshop]"
        );

    workshopElements.forEach(el => {

        el.textContent =
            workshop.name || "Selected Workshop";

    });
}


/* =========================================================
   12. LOGIN / USER SYSTEM
   ========================================================= */

function getCurrentUser() {

    return getStorage(
        AUTO_LUX_STORAGE.user,
        null
    );
}


function loginDemo(user) {

    if (!user || !user.email) {

        showToast(
            "Please enter your login details.",
            "error"
        );

        return false;
    }

    const userData = {
        name: user.name || "AutoLux Customer",
        email: user.email,
        phone: user.phone || "",
        vehicle: user.vehicle || null,
        loginTime: new Date().toISOString()
    };

    setStorage(
        AUTO_LUX_STORAGE.user,
        userData
    );

    updateAuthUI();

    showToast(
        `Welcome to AutoLux, ${userData.name}!`,
        "success"
    );

    return true;
}


function logoutDemo() {

    localStorage.removeItem(
        AUTO_LUX_STORAGE.user
    );

    updateAuthUI();

    showToast(
        "You have been logged out.",
        "success"
    );
}


function updateAuthUI() {

    const user =
        getCurrentUser();

    const loginElements =
        document.querySelectorAll(
            "[data-auth-login]"
        );

    const userElements =
        document.querySelectorAll(
            "[data-auth-user]"
        );


    loginElements.forEach(el => {

        if (user) {

            el.textContent =
                "My Account";

            el.href =
                "account.html";

        } else {

            el.textContent =
                "Login";

            el.href =
                "login.html";
        }

    });


    userElements.forEach(el => {

        el.textContent =
            user
                ? user.name
                : "Guest";

    });
}


/* =========================================================
   13. BOOKING SYSTEM
   ========================================================= */

function getBookings() {

    return getStorage(
        AUTO_LUX_STORAGE.bookings,
        []
    );
}


function createBooking(booking) {

    if (!booking) return null;

    const bookings =
        getBookings();


    const newBooking = {

        id:
            "ALX-BK-" +
            Math.floor(
                100000 +
                Math.random() * 900000
            ),

        ...booking,

        createdAt:
            new Date().toISOString()

    };


    bookings.push(newBooking);


    setStorage(
        AUTO_LUX_STORAGE.bookings,
        bookings
    );


    showToast(
        "Installation booking created successfully.",
        "success"
    );


    return newBooking;
}


/* =========================================================
   14. TOAST NOTIFICATION
   ========================================================= */

function showToast(message, type = "success") {

    let container =
        document.querySelector(
            "#autoluxToastContainer"
        );


    if (!container) {

        container =
            document.createElement("div");

        container.id =
            "autoluxToastContainer";

        container.style.position =
            "fixed";

        container.style.right =
            "20px";

        container.style.bottom =
            "20px";

        container.style.zIndex =
            "99999";

        container.style.display =
            "flex";

        container.style.flexDirection =
            "column";

        container.style.gap =
            "10px";

        document.body.appendChild(
            container
        );
    }


    const toast =
        document.createElement("div");


    toast.textContent =
        message;


    toast.style.padding =
        "14px 20px";

    toast.style.borderRadius =
        "12px";

    toast.style.background =
        type === "error"
            ? "#c62828"
            : "#111";

    toast.style.color =
        "#fff";

    toast.style.fontSize =
        "14px";

    toast.style.fontWeight =
        "600";

    toast.style.boxShadow =
        "0 10px 30px rgba(0,0,0,.2)";

    toast.style.opacity =
        "0";

    toast.style.transform =
        "translateY(20px)";

    toast.style.transition =
        "all .3s ease";


    container.appendChild(toast);


    requestAnimationFrame(() => {

        toast.style.opacity =
            "1";

        toast.style.transform =
            "translateY(0)";

    });


    setTimeout(() => {

        toast.style.opacity =
            "0";

        toast.style.transform =
            "translateY(20px)";

        setTimeout(() => {
            toast.remove();
        }, 300);

    }, 3000);
}


/* =========================================================
   15. GENERATE DEMO ORDER ID
   ========================================================= */

function generateOrderId() {

    return (
        "ALX-" +
        Math.floor(
            100000 +
            Math.random() * 900000
        )
    );
}


/* =========================================================
   16. PRODUCT DATA HELPER
   ========================================================= */

function getProductFromElement(element) {

    if (!element) return null;


    return {

        id:
            element.dataset.productId ||
            element.dataset.id ||
            "",

        name:
            element.dataset.productName ||
            element.dataset.name ||
            "AutoLux Product",

        price:
            Number(
                element.dataset.productPrice ||
                element.dataset.price ||
                0
            ),

        image:
            element.dataset.productImage ||
            element.dataset.image ||
            "",

        category:
            element.dataset.category ||
            "Accessories",

        installation:
            element.dataset.installation === "true",

        evCompatible:
            element.dataset.evCompatible === "true"

    };
}


/* =========================================================
   17. GLOBAL BUTTON EVENT HANDLING
   ========================================================= */

document.addEventListener(
    "click",
    function(event) {

        /* -------------------------------
           ADD TO CART
        -------------------------------- */

        const cartButton =
            event.target.closest(
                "[data-add-cart]"
            );

        if (cartButton) {

            event.preventDefault();

            const product =
                getProductFromElement(
                    cartButton
                );

            addToCart(product);

            return;
        }


        /* -------------------------------
           WISHLIST
        -------------------------------- */

        const wishlistButton =
            event.target.closest(
                "[data-wishlist]"
            );

        if (wishlistButton) {

            event.preventDefault();

            toggleWishlist(
                wishlistButton.dataset.wishlist
            );

            return;
        }


        /* -------------------------------
           COMPARE
        -------------------------------- */

        const compareButton =
            event.target.closest(
                "[data-compare]"
            );

        if (compareButton) {

            event.preventDefault();

            const product =
                getProductFromElement(
                    compareButton
                );

            addToCompare(product);

            return;
        }


        /* -------------------------------
           REMOVE COMPARE
        -------------------------------- */

        const removeCompareButton =
            event.target.closest(
                "[data-remove-compare]"
            );

        if (removeCompareButton) {

            event.preventDefault();

            removeFromCompare(
                removeCompareButton.dataset
                    .removeCompare
            );

            return;
        }


        /* -------------------------------
           WORKSHOP
        -------------------------------- */

        const workshopButton =
            event.target.closest(
                "[data-select-workshop]"
            );

        if (workshopButton) {

            event.preventDefault();

            const workshop = {

                id:
                    workshopButton.dataset.workshopId,

                name:
                    workshopButton.dataset.workshopName,

                location:
                    workshopButton.dataset.workshopLocation,

                distance:
                    workshopButton.dataset.workshopDistance,

                rating:
                    workshopButton.dataset.workshopRating

            };

            selectWorkshopGlobal(
                workshop
            );

            return;
        }

    }
);


/* =========================================================
   18. PRODUCT QUICK ACTION
   ========================================================= */

function quickAddToCart(
    id,
    name,
    price,
    image = "",
    category = "Accessories"
) {

    addToCart({

        id: id,
        name: name,
        price: price,
        image: image,
        category: category

    });
}


/* =========================================================
   19. CHECKOUT PROTECTION
   ========================================================= */

function requireLogin() {

    const user =
        getCurrentUser();

    if (!user) {

        showToast(
            "Please login before continuing.",
            "error"
        );

        setTimeout(() => {

            window.location.href =
                "login.html";

        }, 1200);

        return false;
    }

    return true;
}


/* =========================================================
   20. GO TO CHECKOUT
   ========================================================= */

function goToCheckout() {

    const cart =
        getCart();

    if (cart.length === 0) {

        showToast(
            "Your cart is empty.",
            "error"
        );

        return;
    }


    window.location.href =
        "checkout.html";
}


/* =========================================================
   21. GO TO BOOKING
   ========================================================= */

function goToBooking() {

    window.location.href =
        "booking.html";
}


/* =========================================================
   22. GO TO WORKSHOPS
   ========================================================= */

function goToWorkshops() {

    window.location.href =
        "workshops.html";
}


/* =========================================================
   23. EV VEHICLE CHECK
   ========================================================= */

function isEVVehicle() {

    const vehicle =
        getVehicle();

    if (!vehicle) return false;

    return (
        vehicle.ev === true ||
        vehicle.ev === "true" ||
        vehicle.fuelType === "EV"
    );
}


function showEVMessage() {

    if (isEVVehicle()) {

        showToast(
            "EV mode enabled ⚡ — showing EV-compatible options.",
            "success"
        );

    }
}


/* =========================================================
   24. SEARCH / FILTER HELPER
   ========================================================= */

function filterElements(
    searchTerm,
    selector
) {

    const elements =
        document.querySelectorAll(
            selector
        );

    const term =
        String(searchTerm || "")
            .toLowerCase()
            .trim();


    elements.forEach(element => {

        const text =
            element.textContent
                .toLowerCase();

        element.style.display =
            text.includes(term)
                ? ""
                : "none";

    });
}


/* =========================================================
   25. SMOOTH SCROLL
   ========================================================= */

function smoothScrollTo(
    selector
) {

    const element =
        document.querySelector(
            selector
        );

    if (!element) return;

    element.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


/* =========================================================
   26. INITIALIZE AUTOLUX
   ========================================================= */

function initAutoLux() {

    updateCartBadge();

    updateCompareCount();

    updateWishlistButtons();

    updateVehicleUI();

    updateAuthUI();

    renderCartIfPresent();

    showEVMessage();

    console.log(
        "🚗 AutoLux initialized successfully."
    );
}


/* =========================================================
   27. DOM READY
   ========================================================= */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initAutoLux
    );

} else {

    initAutoLux();

}


/* =========================================================
   28. GLOBAL AUTOLUX OBJECT
   ========================================================= */

window.AutoLux = {

    /* Cart */
    getCart,
    addToCart,
    removeFromCart,
    changeCartQuantity,
    clearCart,
    getCartSubtotal,
    formatCurrency,

    /* Wishlist */
    getWishlist,
    isWishlisted,
    toggleWishlist,

    /* Compare */
    getCompare,
    addToCompare,
    removeFromCompare,
    clearCompare,

    /* Vehicle */
    saveVehicle,
    getVehicle,

    /* Workshop */
    saveWorkshop,
    getWorkshop,
    selectWorkshopGlobal,

    /* User */
    getCurrentUser,
    loginDemo,
    logoutDemo,

    /* Booking */
    getBookings,
    createBooking,

    /* Navigation */
    goToCheckout,
    goToBooking,
    goToWorkshops,

    /* Utilities */
    showToast,
    generateOrderId,
    filterElements,
    smoothScrollTo

};


console.log(
    "AutoLux JS loaded — Shop • Install • EV • Workshop"
);
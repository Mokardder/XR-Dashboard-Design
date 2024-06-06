class Db {
  constructor(api_key) {
    this.api_key = api_key;
    this.url = `https://script.google.com/macros/s/${this.api_key}/exec`;
  }

  async fetch(type, value = "") {
    try {
      const response = await fetch(this.url, {
        method: "POST",
        body: JSON.stringify({
          type: type,
        }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok.");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error:", error);
      throw error; // Rethrow the error for the caller to handle
    }
  }
  async deedup(val) {
    try {
      const response = await fetch(this.url, {
        method: "POST",
        body: JSON.stringify({
          type: "deedup",
          find: val,
        }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok.");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error:", error);
      throw error; // Rethrow the error for the caller to handle
    }
  }
  async updateUserData(val) {
    try {
      const response = await fetch(this.url, {
        method: "POST",
        body: JSON.stringify({
          type: "updateUserBase",
          search_term: val.searchTerm,
          db_column: val.dbCol,
          value: val.value,
        }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok.");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error:", error);
      throw error; // Rethrow the error for the caller to handle
    }
  }
  async addUserData(val) {
    console.log({
      type: "newUserReg",
      data: val,
    });
    try {
      const response = await fetch(this.url, {
        method: "POST",
        body: JSON.stringify({
          type: "newUserReg",
          data: val,
        }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok.");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error:", error);
      throw error; // Rethrow the error for the caller to handle
    }
  }
}

const getCurrentDate = () => {
  const date = new Date();
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

const opacityAnimater = (tag, isPlay, isSubElement = false) => {
  if (isSubElement) {
    let parentTag = tag;
    let loader_check = parentTag.querySelector("#deedup_loader");

    if (loader_check == null) {
      const tempElement = document.createElement("div");

      const temp = `
      <div id="deedup_loader" class="loader-grey">
        <div class="loader"></div>
      </div>
      
      `;
      tempElement.innerHTML = temp;

      parentTag.appendChild(tempElement);
      tag = parentTag.querySelector("#deedup_loader");
    } else {
      tag = loader_check;
    }
  }

  if (tag.classList.contains("playAnimation")) {
    tag.classList.remove("playAnimation");
  }
  if (tag.classList.contains("playOffAnimation")) {
    tag.classList.remove("playOffAnimation");
  }
  const isNone = tag.style.display;

  if (isPlay) {
    tag.style.display = "flex";
    tag.classList.add("playAnimation");
  } else {
    tag.classList.add("playOffAnimation");
  }
  tag.onanimationend = (data) => {
    if (data.animationName === "animateOpacityPlayOff") {
      tag.style.display = "none";
    }
  };
};

const initUserInput = () => {
  const inputs = document.querySelectorAll(".inputs");
  const mobile_no = document.querySelector("#ct_number");
  inputs.forEach((e) => {
    const prevVal = e.value;
    e.oninput = (x) => {
      const newVal = e.value;
      if (prevVal != newVal) {
        e.previousElementSibling.style.display = "flex";
      } else {
        e.previousElementSibling.style.display = "none";
      }
      let details = {
        id: x.srcElement.id,
        value: e.value,
        dbCol: e.getAttribute("col"),
        searchTerm: mobile_no.value,
      };
      e.setAttribute("data", JSON.stringify(details));
    };
  });
};
const initUpdateBtn = () => {
  const btn = document.querySelectorAll(".consumer-data .ico");
  btn.forEach((e) => {
    const selectedInp = e.nextElementSibling;

    e.onclick = () => {
      const dataOfInp = JSON.parse(selectedInp.getAttribute("data"));
      const container = e.parentElement;
      opacityAnimater(container, true, true);
      db.updateUserData(dataOfInp).then((res) => {
        if (res.statusCode === "OK") {
          opacityAnimater(container, false, true);
          e.style.display = "none";
        }
      });
    };
  });
};

const validator = {
  // Arrow function to format a date as YYYY-MM-DD
  formatDate: (date) => {
    return date.toISOString().split("T")[0];
  },

  // Function to check if today has passed
  checkIfTodayPassed: () => {
    const today = new Date();
    const formattedToday = validator.formatDate(today);

    // Retrieve the stored date from local storage
    const storedDate = localStorage.getItem("storedDate");

    if (storedDate === formattedToday) {
      return false; // Today has not passed
    } else {
      // Update local storage with the current date
      localStorage.setItem("storedDate", formattedToday);
      return true; // Today has passed
    }
  },
};

//[]==> Code Starts Here *** =====>

const key =
  "AKfycbwyvy9POPWYqZiN3-Itzbo1vNcLcg0DEPv2eCzICsDFhpdf8_dLIRJNvwZtyCOD3Dcw";
const deedupSearchBtn = document.querySelector("#deedupSearchBtn"),
  deedupValue = document.querySelector("#deedupSearchValue"),
  quickbar_loader = document.querySelector("#quickbar_loader"),
  l10User_loader = document.querySelector("#l10User_loader");

const db = new Db(key);

// Update 10 data Table
const table = document.querySelector("#lastAddedUsers");

if (validator.checkIfTodayPassed()) {
  // Fetching Last 10 Data from DB
  opacityAnimater(l10User_loader, true);
  db.fetch("last10Data").then((data) => {
    opacityAnimater(l10User_loader, false);

    localStorage.setItem("last10Data", JSON.stringify(data, null, 2));

    data.data.forEach((e) => {
      const newRow = document.createElement("tr");
      newRow.innerHTML = `
                  <td>${e.consumer_id}</td>
                  <td>${e.name}</td>
                  <td>${e.mobile_no}</td>
                  <td>${
                    e.subscription == "" ? "No Annual" : e.subscription
                  }</td>
              `;

      table.appendChild(newRow);
    });
  });
  opacityAnimater(quickbar_loader, true);

  // Fetching quickbar from DB
  db.fetch("quickbar").then((data) => {
    localStorage.setItem("quickbar_data", JSON.stringify(data, null, 2));

    opacityAnimater(quickbar_loader, false);
    const totalConsumer = document.querySelector("#totalConsumer"),
      totalAnnual = document.querySelector("#totalAnnual"),
      totalRechargeEnd = document.querySelector("#totalRechargeEnd"),
      totalErrorCustomer = document.querySelector("#totalErrorCustomer");

    const val = data.data;
    totalConsumer.textContent = val.totalXR;
    totalAnnual.textContent = val.totalAnnual;
    totalRechargeEnd.textContent = val.annualEnd;
    totalErrorCustomer.textContent = val.errorCustomer;
  });
} else {
  const last10Data = JSON.parse(localStorage.getItem("last10Data"));

  last10Data.data.forEach((e) => {
    const newRow = document.createElement("tr");

    newRow.innerHTML = `
                <td>${e.consumer_id}</td>
                <td>${e.name}</td>
                <td>${e.mobile_no}</td>
                <td>${e.subscription == "" ? "No Annual" : e.subscription}</td>
            `;
    table.appendChild(newRow);
  });

  const quickbar = JSON.parse(localStorage.getItem("quickbar_data"));

  const totalConsumer = document.querySelector("#totalConsumer"),
    totalAnnual = document.querySelector("#totalAnnual"),
    totalRechargeEnd = document.querySelector("#totalRechargeEnd"),
    totalErrorCustomer = document.querySelector("#totalErrorCustomer");

  const val = quickbar.data;
  totalConsumer.textContent = val.totalXR;
  totalAnnual.textContent = val.totalAnnual;
  totalRechargeEnd.textContent = val.annualEnd;
  totalErrorCustomer.textContent = val.errorCustomer;
}

// Update Quickbar

const customer_tab = document.querySelector(".consumer-data");
const loader = document.querySelector("#deedup_loader");
let isNewXR = false;

deedupSearchBtn.onclick = () => {
  const err_msg = document.querySelector(".err_msg");

  const value = deedupValue.value;

  opacityAnimater(loader, true);

  db.deedup(value).then((data) => {
    console.log(data);
    opacityAnimater(loader, false);
    const status = data.statusCode;
    const msg = data.data.msg;
    const dataVal = data.data[0];
    customer_tab.style.display = "flex";

    if (status === "OK") {
      // customer_tab.style.display = "flex";
      customer_tab.querySelector("#ct_cons_id").value = dataVal.consumer_id;
      customer_tab.querySelector("#ct_name").value = dataVal.name;
      customer_tab.querySelector("#ct_number").value = dataVal.mobile_no;
      customer_tab.querySelector("#ct_status").value = dataVal.status;
      customer_tab.querySelector("#ct_subscription").value =
        dataVal.subscription;
      if (dataVal.subscription > 1) {
        isNewXR = true;
      }
      customer_tab.querySelector("#ct_spouse").value = dataVal.spouse_name;
      customer_tab.querySelector("#ct_AlNumber").value =
        dataVal.alternate_number;
      customer_tab.querySelector("#ct_village").value = dataVal.village;
      customer_tab.querySelector("#ct_location").value = dataVal.location;
      customer_tab.querySelector("#ct_book_date").value = dataVal.booking_date;
      customer_tab.querySelector("#ct_annual_date").value = dataVal.annual_date;
      customer_tab.querySelector("#ct_con_type").value = dataVal.con_type;
      initUserInput();
      initUpdateBtn();
    } else {
      const header_text = document.querySelector(".header_text");
      const submit_btn = document.querySelector(".submit_btn");
      submit_btn.style.display = "block";
      header_text.style.display = "block";
      header_text.textContent = msg;
      isNewXR = true;

      customer_tab.querySelector("#ct_number").value = value;

      submit_btn.onclick = () => {
        opacityAnimater(loader, true, false);
        const new_reg_payload = {
          cons_id: JSON.stringify({
            val: customer_tab.querySelector("#ct_cons_id").value,
            db_column: customer_tab
              .querySelector("#ct_cons_id")
              .getAttribute("col"),
          }),
          name: JSON.stringify({
            val: customer_tab.querySelector("#ct_name").value,
            db_column: customer_tab
              .querySelector("#ct_name")
              .getAttribute("col"),
          }),
          number: JSON.stringify({
            val: customer_tab.querySelector("#ct_number").value,
            db_column: customer_tab
              .querySelector("#ct_number")
              .getAttribute("col"),
          }),
          status: JSON.stringify({
            val: customer_tab.querySelector("#ct_status").value,
            db_column: customer_tab
              .querySelector("#ct_status")
              .getAttribute("col"),
          }),
          subscription: JSON.stringify({
            val: customer_tab.querySelector("#ct_subscription").value,
            db_column: customer_tab
              .querySelector("#ct_subscription")
              .getAttribute("col"),
          }),
          spouse: JSON.stringify({
            val: customer_tab.querySelector("#ct_spouse").value,
            db_column: customer_tab
              .querySelector("#ct_spouse")
              .getAttribute("col"),
          }),
          al_number: JSON.stringify({
            val: customer_tab.querySelector("#ct_AlNumber").value,
            db_column: customer_tab
              .querySelector("#ct_AlNumber")
              .getAttribute("col"),
          }),
          village: JSON.stringify({
            val: customer_tab.querySelector("#ct_village").value,
            db_column: customer_tab
              .querySelector("#ct_village")
              .getAttribute("col"),
          }),
          location: JSON.stringify({
            val: customer_tab.querySelector("#ct_location").value,
            db_column: customer_tab
              .querySelector("#ct_location")
              .getAttribute("col"),
          }),
          book_date: JSON.stringify({
            val: customer_tab.querySelector("#ct_book_date").value,
            db_column: customer_tab
              .querySelector("#ct_book_date")
              .getAttribute("col"),
          }),
          annual_date: JSON.stringify({
            val: new String(
              customer_tab.querySelector("#ct_annual_date").value
            ),
            db_column: customer_tab
              .querySelector("#ct_annual_date")
              .getAttribute("col"),
          }),
          consumer_type: JSON.stringify({
            val: customer_tab.querySelector("#ct_con_type").value,
            db_column: customer_tab
              .querySelector("#ct_con_type")
              .getAttribute("col"),
          }),
        };

        console.log(new_reg_payload);

        db.addUserData(new_reg_payload).then((data) => {
          opacityAnimater(loader, false, false);
          console.log(data);
        });
      };
    }
  });
};

const subscription = customer_tab.querySelector("#ct_subscription");

subscription.oninput = (e) => {
  console.log();
  if (subscription.value.length == 0) {
    customer_tab.querySelector("#ct_book_date").value = "";
    customer_tab.querySelector("#ct_annual_date").value = "";
  }
  if (subscription.value > 2) {
    if (isNewXR) {
      const today = getCurrentDate();
      customer_tab.querySelector("#ct_book_date").value = today;
      customer_tab.querySelector("#ct_annual_date").value = today;
    }
  }
};

// const MAIN_URL = window.location.origin;
const MAIN_URL = `http://localhost:1323`;

function $$(ele) {
  return document.getElementById(ele);
}

function customInput(mod, obj, next = null) {
  return {
    session: "2",
    module: mod,
    nextModule: next,
    elem: $$(mod),
    each: function (fn) {
      let lists = this.elem.querySelectorAll("[data-kyc]");
      for (let i = 0; i < lists.length; i++) {
        fn(lists[i], lists[i].getAttribute("data-kyc"), lists[i].value);
      }
    },
    save: function (fnerror, callback) {
      let dataElem = {};
      this.each(function (elem, name, val) {
        let dataChild = {};
        if (obj != null) {
          if (name in obj) {
            for (const elemKey in obj) {
              if (elemKey == name) {
                let objElem = obj[elemKey];
                if (objElem.type == "select-all") {
                  for (const key in objElem) {
                    if (key != "type") {
                      if (val == key) {
                        objElem[key].value = "Y";
                      } else {
                        objElem[key].value = "N";
                      }
                      dataChild[key] = objElem[key].value;
                    }
                  }
                  dataElem[name] = dataChild;
                } else if (objElem.type == "select-one") {
                  dataElem[name] = objElem[val];
                }
              }
            }
          } else if (elem.type == "checkbox") {
            dataElem[name] = elem.checked ? "Y" : "N";
          } else {
            dataElem[name] = val;
          }
        } else {
          if (elem.type == "checkbox") {
            if (
              module != "module_fatcaPart1" &&
              module != "module_fatcaPart2"
            ) {
              dataElem[name] = elem.checked ? "Y" : "N";
            } else {
              dataElem[name] = elem.checked;
            }
          } else if (elem.type == "radio") {
            dataElem[name] = elem.checked;
          } else {
            if (name == "MultiBankList") {
              if (val != "") {
                dataElem[name] = JSON.parse(val);
              }
            } else {
              let stringVal = val;
              const textArea = document.createElement("textarea");
              textArea.innerText = stringVal;

              dataElem[name] = textArea.innerText;

              if (dataElem[name] === undefined || dataElem[name] === null)
                dataElem[name] = null;

              if (dataElem[name] === "") dataElem[name] = null;
            }
          }
        }
      });

      //specific case convert data
      if (mod == "module_assessmentBasic") {
        if (!dataElem["SuitQ4"]) dataElem["SuitQ4"] = "";
        let dataSuitQ4 = "";

        if (dataElem["exp_bank"] && dataElem["exp_bank"] == "Y") {
          dataSuitQ4 += "50,";
        }
        if (dataElem["exp_fund"] && dataElem["exp_fund"] == "Y") {
          dataSuitQ4 += "51,";
        }
        if (dataElem["exp_debenture"] && dataElem["exp_debenture"] == "Y") {
          dataSuitQ4 += "52,";
        }
        if (dataElem["mutual_fund"] && dataElem["mutual_fund"] == "Y") {
          dataSuitQ4 += "53,";
        }

        if (dataSuitQ4 != "") {
          dataSuitQ4 = dataSuitQ4.substring(0, dataSuitQ4.length - 1);
        }

        dataElem["SuitQ4"] = dataSuitQ4;
      }

      let objRequest = {};
      if (this.nextModule != null && this.nextModule != "") {
        let nextMod = { module: this.nextModule };
        objRequest.next_module = nextMod;
      }
      objRequest.module = this.module;
      objRequest.session = this.session;
      objRequest.parameters = JSON.stringify(dataElem);
      console.log(objRequest.parameters);

      const wsurl = `${MAIN_URL}/api/saveTempdata`;

      fetch(wsurl, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(objRequest),
      })
        .then(function (response) {
          return response.json();
        })
        .then(function (data) {
          console.log(data);
          let dError = "";
          if (data.error != null) {
            dError = data.error.split("|");
          }
          if (data.success) {
            // window.location = `${window.location.origin}/${data.next_module.url}`;
            window.location = `http://localhost/register/form/idcard.html`
          } else if (
            !data.success &&
            dError[1] != "" &&
            dError[1] != undefined
          ) {
            localStorage.setItem("authenKey", dError[1]);
            localStorage.setItem("message", dError[1]);
          } else if (!data.success && data.message != "") {
            localStorage.setItem("message", data.message);
            localStorage.setItem("nModule", data.next_module.url);
          } else {
            if (fnerror) fnerror(data.error);
          }

          if (callback) {
            callback({ sucess: true, data });
          }
        })
        .catch(function (error) {
          console.log(error);
          if (fnerror) fnerror(error);

          if (callback) {
            callback({ sucess: false, error });
          }
        });
    },
    load: function (fn, fnerror) {
      let data = {};

      let objRequest = {};
      objRequest.module = this.module;
      objRequest.session = this.session;
      let querystring = "";
      for (let key in objRequest) {
        if (querystring != "") querystring += "&";
        querystring += key + "=" + objRequest[key];
      }
      const wsurl = `${MAIN_URL}/api/${this.module}`;
      // const wsurl = `${MAIN_URL}/api/loadTempdata/${this.module}`;
      console.log('wsurl',wsurl);
      fetch(wsurl, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })
        .then(function (response) {
          return response.json();
        })
        .then(function (data) {
          console.log(data);
          if (data.success) {
            if (fn) fn(JSON.parse(data.data));
          } else {
            if (typeof fnerror != "undefined") fnerror(data.error);
          }
        })
        .catch(function (error) {});
    },
  };
}

function customLoad(moduleName, fn) {
  let module = customInput(moduleName);
  module.load(function (data) {
    module.each(function (elem, name) {
      if (elem.type == "select-one") {
        if (typeof data[name] == "object") {
          loadSelect("[data-kyc=" + name + "]", data);
        } else {
          $(elem).val(data[name]);
        }
      } else if (elem.type == "checkbox") {
        if (typeof data[name] == "boolean") {
          elem.checked = data[name] ? true : false;
        } else {
          elem.checked = data[name] == "Y" ? true : false;
        }
      } else if (elem.type == "radio") {
        elem.checked = data[name];
      } else {
        $(elem).val(data[name]);
      }
    });
    if (fn) fn(data);
  });
}

function loadSelect(element, data) {
  let elem = $(element);
  let name = elem.attr("data-kyc");
  let child = data[name];
  for (const key in child) {
    if (child[key] == "Y") elem.val(key);
  }
}

function moduleSave(moduleName) {
  let moduleData = moduleInput(moduleName);
  moduleData.save(function (e) {
    alert(e ? "Complete" : "Fail");
  });
}

function moduleSaveCustom(moduleName, moduleData, fn, fnerror) {
  let objRequest = {};
  if (this.nextModule != null && this.nextModule != "") {
    let nextMod = { module: this.nextModule };
    objRequest.next_module = nextMod;
  }
  objRequest.module = moduleName;
  objRequest.session = "2";
  objRequest.parameters = JSON.stringify(moduleData);

  const wsurl = `${MAIN_URL}/api/saveTempdata`;

  fetch(wsurl, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(objRequest),
  })
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      if (data.success) {
        if (fn) fn(data);
      } else {
        if (fnerror) fnerror(data.error);
      }
    })
    .catch(function (error) {
      if (fnerror) fnerror(error);
    });
}

function moduleLoad(moduleName, fn) {
  let moduleData = moduleInput(moduleName);
  moduleData.load(
    function (data) {
      moduleData.each(function (target, name, value) {
        if (target.type == "checkbox") {
          target.checked = data[name];
        }
        if (target.type == "radio") {
          target.checked = data[name];
        } else {
          $(target).val(data[name]);
        }
      });
      if (fn) fn(data);
    },
    function (error) {}
  );
}

function moduleInput(module, next = null) {
  return {
    session: "2",
    moduleName: module,
    nextModule: next,
    target: $$(module),
    field: function (name) {
      return this.target.querySelector("[data-kyc='" + name + "']");
    },
    each: function (fn) {
      let lists = this.target.querySelectorAll("[data-kyc]");
      for (let i = 0; i < lists.length; i++) {
        fn(lists[i], lists[i].getAttribute("data-kyc"), lists[i].value);
      }
    },
    prev: function (fn, fnerror) {
      let data = {};
      const wsurl = `${MAIN_URL}/api/getPrevious/`;
      let objRequest = {};
      objRequest.module = this.moduleName;
      objRequest.session = this.session;
      fetch(wsurl, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(objRequest),
      })
        .then(function (response) {
          return response.json();
        })
        .then(function (data) {
          if (data.success) {
            window.location = `${window.location.origin}/${data.url}`;
          } else {
            if (fnerror) fnerror(data.error);
          }
        })
        .catch(function (error) {});
    },
    save: function (fn, fnerror) {
      let data = {};
      this.each(function (ele) {
        if (ele.type == "checkbox") {
          data[ele.getAttribute("data-kyc")] = ele.checked;
        } else if (ele.type == "radio") {
          if (ele.checked) {
            data[ele.getAttribute("data-kyc")] = ele.checked;
          }
        } else {
          data[ele.getAttribute("data-kyc")] = ele.value;
        }
      });

      let objRequest = {};
      if (this.nextModule != null && this.nextModule != "") {
        let nextMod = { module: this.nextModule };
        objRequest.next_module = nextMod;
      }
      objRequest.module = this.moduleName;
      objRequest.session = this.session;
      objRequest.parameters = JSON.stringify(data);

      const wsurl = `${MAIN_URL}/api/saveTempdata`;

      fetch(wsurl, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(objRequest),
      })
        .then(function (response) {
          return response.json();
        })
        .then(function (data) {
          if (data.success) {
            if (objRequest.module != "module_acceptNDID") {
              window.location = `${window.location.origin}/${data.next_module.url}`;
            }
          } else {
            if (fnerror) fnerror(data.error);
          }
        })
        .catch(function (error) {});
    },
    load: function (fn, fnerror) {
      let data = {};

      let objRequest = {};
      objRequest.module = this.moduleName;
      objRequest.session = this.session;
      let querystring = "";
      for (let key in objRequest) {
        if (querystring != "") querystring += "&";
        querystring += key + "=" + objRequest[key];
      }
      const wsurl = `${MAIN_URL}/api/loadTempdata/${this.moduleName}`;

      fetch(wsurl, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })
        .then(function (response) {
          return response.json();
        })
        .then(function (data) {
          if (data.success) {
            if (fn) fn(JSON.parse(data.data));
            console.table(JSON.parse(data.data));
          } else {
            if (typeof fnerror != "undefined") fnerror(data.error);
          }
        })
        .catch(function (error) {});
    },
  };
}

$(function () {
  $("#btnNext").on("click", (e) => {
    let $this = $(e.currentTarget);
    let name = $this.prop("name");
    let mod = moduleInput(name);
    mod.save(function (res) {});
  });

  $("#btnBack").on("click", (e) => {
    let $this = $(e.currentTarget);
    let name = $this.prop("name");
    if (typeof name != "undefined" && name != "") {
      let mod = moduleInput(name);
      mod.prev(function (res) {});
    } else {
      history.go(-1);
    }
  });
});

function nextStep(moduleName, next) {
  let mod = moduleInput(moduleName, next);
  mod.save(function (res) {});
}

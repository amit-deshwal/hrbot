const express = require("express");
const app = express();
const dff = require("dialogflow-fulfillment");
const mongoose = require("mongoose");
const schema = require("./models/schema");

app.get("/", (req, res) => {
  res.send("We are ghnafsw");
});
app.get("/check", (req, res) => {
  res.send("We are ghnafsw");
});
// var mongoose = require('mongoose');
mongoose.connect(
  "mongodb+srv://amit:1234@cluster0-u2lit.mongodb.net/hrbot?retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

var db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));

db.once("open", function () {
  console.log("Connection Successful...!");
});

app.post("/", express.json(), (req, res) => {
  let ecode;
  const agent = new dff.WebhookClient({
    request: req,
    response: res,
  });
  const collection = "hrbot";
  function demo(agent) {
    agent.add("Sending respnse from server");
  }
  async function setcode(agent) {
    let id = (this.ecode = req.body.queryResult.parameters.number);
    let empName;
    let dataFound;
    await schema.find({ emp_id: `${id}` }, function (err, data) {
      if (err) {
        console.log(err);
        return;
      }

      if (data.length == 0) {
        console.log("No record found");
        dataFound = false;
        return;
      }
      dataFound = true;
      console.log(typeof data);
      empName = data[0]["emp_name"];
    });
    if (dataFound != true) {
      agent.add(`No record found`);
    }
    if (dataFound == true) {
      agent.add(`Thank you, ${empName}.`);
      agent.add(
        `You can check remaining leaves,current manager, update address, update emergency number.`
      );
    }
    // agent.add(`Thank you, ${empName}.`);
    // agent.add(`You can check remaining leaves,current manager, update address, update emergency number.`);
  }
  async function checkLeaves(agent) {
    let id = this.ecode;
    let remainingLeaves;
    await schema.find({ emp_id: `${id}` }, function (err, data) {
      if (err) {
        console.log(err);
        return;
      }

      if (data.length == 0) {
        console.log("No record found");
        return;
      }
      console.log(typeof data);

      remainingLeaves = data[0]["leaves_remaining"];

      console.log(`Hi your leave balance is ${remainingLeaves}`);
    });
    agent.add(`Your leave balance is ${remainingLeaves}.`);
  }
  async function getCurrentManager(agent) {
    let id = this.ecode;
    let manager;
    await schema.find({ emp_id: `${id}` }, function (err, data) {
      if (err) {
        console.log(err);
        return;
      }

      if (data.length == 0) {
        console.log("No record found");
        return;
      }
      console.log(typeof data);

      manager = data[0]["reporting_manager"];
    });
    agent.add(`You are currently reporting to ${manager}.`);
  }
  async function getEmergencyContact(agent) {
    let id = this.ecode;
    let emergency_no;
    await schema.find({ emp_id: `${id}` }, function (err, data) {
      if (err) {
        console.log(err);
        return;
      }

      if (data.length == 0) {
        console.log("No record found");
        return;
      }
      console.log(typeof data);

      emergency_no = data[0]["emergency_no"];
    });
    agent.add(
      `You emergency contact no. is ${emergency_no}, want to update it ?`
    );
  }

  async function updateEmergencyNo(agent) {
    // console.log("myecode",this.ecode)
    let id = this.ecode;
    const newemgno = req.body.queryResult.parameters["phone-number"];
    console.log("new emgno", newemgno);
    if (newemgno.length < 10 || newemgno.length > 10) {
      agent.add(`Enter a valid 10 digit number.`);
    } else {
      await schema.findOneAndUpdate(
        { emp_id: `${id}` },
        { $set: { emergency_no: `${newemgno}` } },
        { returnOriginal: false },
        function (err, data) {
          if (err) {
            console.log(err);
            return;
          }
          // console.log(data);
        }
      );
      agent.add(`Emergency contact updated successfully.`);
    }
  }

  async function checkAddress(agent) {
    console.log("myecode", this.ecode);
    let id = this.ecode;

    let currentAddress;
    await schema.find({ emp_id: `${id}` }, function (err, data) {
      if (err) {
        console.log(err);
        return;
      }

      if (data.length == 0) {
        console.log("No record found");
        return;
      }
      console.log(typeof data);

      const result = data[0]["reporting_manager"];
      currentAddress = data[0]["address"];
    });
    agent.add(
      `Your current address is ${currentAddress}, do you want to update it?`
    );
  }

  async function updateAddress(agent) {
    // console.log("myecode",this.ecode)
    let id = this.ecode;
    const newAddress = req.body.queryResult.parameters.address;
    console.log("new address", newAddress);
    console.log("id", id);

    await schema.findOneAndUpdate(
      { emp_id: `${id}` },
      { $set: { address: `${newAddress}` } },
      { returnOriginal: false },
      function (err, data) {
        if (err) {
          console.log(err);
          return;
        }
        // console.log(data);
      }
    );
    agent.add(`Address updated successfully.`);
  }

  var intentMap = new Map();

  // intentMap.set("webhookDemo", demo);
  intentMap.set("remainingLeaves", checkLeaves);
  intentMap.set("emp_code", setcode);
  intentMap.set("checkAddress", checkAddress);
  intentMap.set("updateAdd", updateAddress);
  intentMap.set("currentManager", getCurrentManager);
  intentMap.set("emergency_contact", getEmergencyContact);
  intentMap.set("updateEmgergencyNo", updateEmergencyNo);
  agent.handleRequest(intentMap);
});

var server_port = process.env.OPENSHIFT_NODEJS_PORT || 5000;
app.listen(server_port, () => {
  console.log(`Server started at ${server_port}`);
});

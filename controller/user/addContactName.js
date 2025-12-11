const { AllContact, User } = require("../../models");

const addContactName = async (req, res) => {
  let { phone_number, full_name, added_by_me, user_id, contact_user_type } = req.body;
  // added_by_me is customer id
  // user_id is model id
  // contact_user_type is the type of the contact being added ('customer' or 'model')

  console.log("Credentials:::", phone_number, full_name, added_by_me, contact_user_type);

  if (!phone_number || phone_number == "") {
    return res
      .status(400)
      .json({ success: false, message: "phone_number field is required" });
  }
  if (!full_name || full_name == "") {
    return res
      .status(400)
      .json({ success: false, message: "full_name field is required" });
  }

  // Validate contact_user_type
  const validContactUserType = ['customer', 'model'].includes(contact_user_type) ? contact_user_type : null;

  try {
    // const user_id = req.authData.user_id;
    let message;
    const whereConditions = {
      user_id: user_id,
      phone_number: phone_number,
      added_by_me: added_by_me,
    };
    // Add contact_user_type to where conditions if provided
    if (validContactUserType) {
      whereConditions.contact_user_type = validContactUserType;
    }

    const isContactExist = await AllContact.findOne({
      where: whereConditions,
    });

    if (isContactExist) {
      console.log("Founded on contact!");
      const updateData = { full_name: full_name };
      if (validContactUserType) {
        updateData.contact_user_type = validContactUserType;
      }
      await AllContact.update(updateData, {
        where: whereConditions,
      });
      message = "Contact Updated Successfully";
    } else {
      console.log("AAADDDD::", user_id, phone_number);
      // Build user lookup conditions
      const userWhereConditions = {
        user_id: user_id,
        phone_number: phone_number,
      };
      if (validContactUserType) {
        userWhereConditions.user_type = validContactUserType;
      }

      let userDetails = await User.findOne({
        where: userWhereConditions,
      });

      console.log("User Details::", userDetails);

      if (userDetails) {
        console.log("Found on user!");
        const createData = {
          phone_number: phone_number,
          full_name: full_name,
          user_id: user_id,
          added_by_me: added_by_me,
        };
        if (validContactUserType) {
          createData.contact_user_type = validContactUserType;
        }
        await AllContact.create(createData);
        message = "Contact Added Successfully!";
      } else {
        message = "Contact Added failed!";
      }
    }

    // Get user_id - include user_type if provided
    const userWhereClause = { phone_number };
    if (validContactUserType) {
      userWhereClause.user_type = validContactUserType;
    }
    const userData = await User.findOne({
      attributes: ["user_id", "user_type"],
      where: userWhereClause,
    });
    // console.log(userData, "userData");
    return res.status(200).json({
      message: message,
      success: true,
      user_id: userData.user_id,
    });
  } catch (error) {
    console.error("PK Error:::", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { addContactName };

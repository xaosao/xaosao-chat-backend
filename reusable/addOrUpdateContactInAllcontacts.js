const { User, AllContact } = require("../models");

async function addOrUpdateContactInAllcontacts({
  first_name,
  last_name,
  user_id,
  contact_user_type,
}) {
  // Fetch user data
  const userData = await User.findOne({ where: { user_id } });
  if (!userData) return;

  const { phone_number, email_id, user_type } = userData.dataValues;
  const full_name = `${first_name} ${last_name}`;
  // Use provided contact_user_type or fall back to the user's own user_type
  const validContactUserType = contact_user_type || user_type || null;

  // Check if the contact exists by phone_number (and contact_user_type if available)
  const phoneWhereClause = { user_id, phone_number };
  if (validContactUserType) {
    phoneWhereClause.contact_user_type = validContactUserType;
  }
  let contactByPhone = phone_number
    ? await AllContact.findOne({ where: phoneWhereClause })
    : null;

  // Check if the contact exists by email_id (and contact_user_type if available)
  const emailWhereClause = { user_id, email_id };
  if (validContactUserType) {
    emailWhereClause.contact_user_type = validContactUserType;
  }
  let contactByEmail = email_id
    ? await AllContact.findOne({ where: emailWhereClause })
    : null;

  // Update or create for phone_number
  if (contactByPhone) {
    const updateData = { full_name, added_by_me: true };
    if (validContactUserType) {
      updateData.contact_user_type = validContactUserType;
    }
    await AllContact.update(updateData, { where: phoneWhereClause });
  } else if (phone_number) {
    const createData = {
      user_id,
      phone_number,
      full_name,
      added_by_me: true,
    };
    if (validContactUserType) {
      createData.contact_user_type = validContactUserType;
    }
    await AllContact.create(createData);
  }

  // Update or create for email_id
  if (contactByEmail) {
    const updateData = { full_name, added_by_me: true };
    if (validContactUserType) {
      updateData.contact_user_type = validContactUserType;
    }
    await AllContact.update(updateData, { where: emailWhereClause });
  } else if (email_id) {
    const createData = {
      user_id,
      email_id,
      full_name,
      added_by_me: true,
    };
    if (validContactUserType) {
      createData.contact_user_type = validContactUserType;
    }
    await AllContact.create(createData);
  }
}

module.exports = addOrUpdateContactInAllcontacts;

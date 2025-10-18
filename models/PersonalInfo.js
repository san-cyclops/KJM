const { pool } = require("../config/database");

class PersonalInfo {
  static async getAll() {
    try {
      const [rows] = await pool.execute(`
        SELECT * FROM personal_info 
        ORDER BY created_at DESC
      `);
      return rows;
    } catch (error) {
      console.error("Error getting all personal info:", error);
      throw error;
    }
  }

  static async getById(id) {
    try {
      const [rows] = await pool.execute(
        "SELECT * FROM personal_info WHERE id = ?",
        [id]
      );
      return rows[0];
    } catch (error) {
      console.error("Error getting personal info by id:", error);
      throw error;
    }
  }

  static async create(personalInfo) {
    try {
      const insertQuery = `
        INSERT INTO personal_info (
          date, full_name, permanent_address_no, permanent_address_street, 
          permanent_address_area, permanent_address_city, mobile_number, 
          identity_card_number, whatsapp_number, civil_status, residence, 
          residence_owner_name, residence_owner_mobile, profession,
          special_need_child_details, no_of_non_related_people, nrp1_full_name,
          nrp1_nic_number, nrp1_address, nrp1_purpose_of_staying,
          sandha_membership_amount, paying_sandha_other_masjidh, other_masjidh_sandha_details
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const values = [
        personalInfo.date,
        personalInfo.full_name,
        personalInfo.permanent_address_no,
        personalInfo.permanent_address_street,
        personalInfo.permanent_address_area,
        personalInfo.permanent_address_city,
        personalInfo.mobile_number,
        personalInfo.identity_card_number,
        personalInfo.whatsapp_number,
        personalInfo.civil_status,
        personalInfo.residence,
        personalInfo.residence_owner_name,
        personalInfo.residence_owner_mobile,
        personalInfo.profession,
        personalInfo.special_need_child_details,
        personalInfo.no_of_non_related_people,
        personalInfo.nrp1_full_name,
        personalInfo.nrp1_nic_number,
        personalInfo.nrp1_address,
        personalInfo.nrp1_purpose_of_staying,
        personalInfo.sandha_membership_amount,
        personalInfo.paying_sandha_other_masjidh,
        personalInfo.other_masjidh_sandha_details,
      ];

      const [result] = await pool.execute(insertQuery, values);
      return result.insertId;
    } catch (error) {
      console.error("Error creating personal info:", error);
      throw error;
    }
  }

  static async update(id, personalInfo) {
    try {
      const updateQuery = `
        UPDATE personal_info SET 
          date = ?, full_name = ?, permanent_address_no = ?, 
          permanent_address_street = ?, permanent_address_area = ?, 
          permanent_address_city = ?, mobile_number = ?, 
          identity_card_number = ?, whatsapp_number = ?, 
          civil_status = ?, residence = ?, residence_owner_name = ?, 
          residence_owner_mobile = ?, profession = ?,
          special_need_child_details = ?, no_of_non_related_people = ?, nrp1_full_name = ?,
          nrp1_nic_number = ?, nrp1_address = ?, nrp1_purpose_of_staying = ?,
          sandha_membership_amount = ?, paying_sandha_other_masjidh = ?, other_masjidh_sandha_details = ?
        WHERE id = ?
      `;

      const values = [
        personalInfo.date,
        personalInfo.full_name,
        personalInfo.permanent_address_no,
        personalInfo.permanent_address_street,
        personalInfo.permanent_address_area,
        personalInfo.permanent_address_city,
        personalInfo.mobile_number,
        personalInfo.identity_card_number,
        personalInfo.whatsapp_number,
        personalInfo.civil_status,
        personalInfo.residence,
        personalInfo.residence_owner_name,
        personalInfo.residence_owner_mobile,
        personalInfo.profession,
        personalInfo.special_need_child_details,
        personalInfo.no_of_non_related_people,
        personalInfo.nrp1_full_name,
        personalInfo.nrp1_nic_number,
        personalInfo.nrp1_address,
        personalInfo.nrp1_purpose_of_staying,
        personalInfo.sandha_membership_amount,
        personalInfo.paying_sandha_other_masjidh,
        personalInfo.other_masjidh_sandha_details,
        id,
      ];

      const [result] = await pool.execute(updateQuery, values);
      return result.affectedRows > 0;
    } catch (error) {
      console.error("Error updating personal info:", error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      const [result] = await pool.execute(
        "DELETE FROM personal_info WHERE id = ?",
        [id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error("Error deleting personal info:", error);
      throw error;
    }
  }

  static async findByIdentityCard(identityCard) {
    try {
      const [rows] = await pool.execute(
        "SELECT * FROM personal_info WHERE identity_card_number = ?",
        [identityCard]
      );
      return rows[0];
    } catch (error) {
      console.error("Error finding personal info by identity card:", error);
      throw error;
    }
  }
}

module.exports = PersonalInfo;

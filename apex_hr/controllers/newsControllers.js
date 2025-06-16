const pool = require('../config/db'); // เชื่อมต่อฐานข้อมูล MySQL
const multer = require('multer');
const path = require('path');
const fs = require("fs");
const { promisify } = require('util');

// Promisify pool.query for async/await usage
const query = promisify(pool.query).bind(pool);

const uploadsDir = path.join(__dirname, "../uploads");

// Create the uploads directory if it doesn't exist
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer storage to save files with unique names
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir); // Save files to the 'uploads' directory
  },
  filename: (req, file, cb) => {
    // Generate a unique filename using timestamp and random string, retaining the original file extension
    const uniqueSuffix = Date.now() + '-' + Math.random().toString(36).substring(2, 15);
    const fileExtension = path.extname(file.originalname); // Get the file's extension
    const filename = `${uniqueSuffix}${fileExtension}`;
    cb(null, filename); // Set the unique filename
  },
});

// File filter to allow only specific file types (JPEG, PNG, PDF)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only JPEG, PNG, and PDF are allowed."), false);
  }
};

// Multer setup for handling file uploads
exports.upload = multer({ storage, fileFilter });

exports.getcategorynews = async (req, res) => {
  try {
    const [results] = await pool.query('SELECT * FROM master_cate_news');
    return res.status(200).json(results);
  } catch (err) {
    return res.status(500).json({ message: 'Database query failed', error: err.message });
  }
};

exports.addnews = async (req, res) => {
  const {
    topic,
    content,
    cate_news_id,
    pin = 0,
    hide = 0,
    status = 'ACTIVE',
    create_name = null,
    modify_name = null
  } = req.body;

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // ✅ บันทึกข่าวก่อน (ไม่มี attachment_id)
    const [newsResult] = await connection.query(
      `INSERT INTO news (topic, content, cate_news_id, pin, hide, status, create_date, modify_date)
       VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [topic, content, cate_news_id, pin, hide, status]
    );

    const newNewsId = newsResult.insertId; // ใช้ชื่อ newNewsId ตามที่ต้องการ

    // ✅ จัดการไฟล์แนบ (ถ้ามี) โดยใช้ newNewsId ใส่ลงใน reference_id
    const uploadedFiles = [];
    const allAttachmentIds = [];

    if (req.files && req.files['file_name'] && req.files['file_name'].length > 0) {
      for (let i = 0; i < req.files['file_name'].length; i++) {
        const file = req.files['file_name'][i];
        const fileName = file.filename;
        const filePath = `/uploads/${fileName}`;

        // สร้าง attachment แต่ละไฟล์ โดยใช้ newNewsId ใส่ใน reference_id
        const [attachmentResult] = await connection.query(
          `INSERT INTO attachment (file_name, file_path, reference_type, reference_id, description, create_name, modify_name, create_date, modify_date) 
           VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          [fileName, filePath, 'news', newNewsId, 'news', create_name, modify_name]
        );

        allAttachmentIds.push(attachmentResult.insertId);
        uploadedFiles.push({
          attachment_id: attachmentResult.insertId,
          file_name: fileName,
          file_path: filePath
        });
      }
    }

    await connection.commit();

    return res.status(200).json({
      message: 'เพิ่มข้อมูลข่าวสำเร็จ',
      insertedId: newNewsId,
      attachment_ids: allAttachmentIds,
      data: {
        id: newNewsId,
        topic,
        content,
        cate_news_id,
        uploaded_files: uploadedFiles,
        files_count: uploadedFiles.length,
        pin,
        hide,
        status,
        create_name,
        modify_name
      }
    });

  } catch (err) {
    await connection.rollback();
    console.error('Database error:', err);
    res.status(500).json({
      error: 'เกิดข้อผิดพลาดในการเพิ่มข่าว',
      detail: err.message
    });
  } finally {
    connection.release();
  }
};




exports.addnewsFixed = async (req, res) => {
  const {
    topic,
    content,
    cate_news_id,
    attachment_id,
    pin = 0,
    hide = 0,
    status = 'ACTIVE',
    create_name = null,
    modify_name = null
  } = req.body;

  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    let finalAttachmentId = attachment_id;
    
    // ถ้ายังไม่มี attachment_id ให้สร้างใหม่
    if (!finalAttachmentId) {
      const [insertAttachment] = await connection.query(
        `INSERT INTO attachment (create_name, modify_name, create_date, modify_date) VALUES (?, ?, NOW(), NOW())`,
        [create_name, modify_name]
      );
      finalAttachmentId = insertAttachment.insertId;
    }

    // จัดการไฟล์หลายตัว
    const uploadedFiles = [];
    const attachmentIds = []; // เก็บ ID ของ attachment ทั้งหมด
    
    if (req.files && req.files['file_name'] && req.files['file_name'].length > 0) {
      for (let i = 0; i < req.files['file_name'].length; i++) {
        const file = req.files['file_name'][i];
        const fileName = file.filename;
        const filePath = `/uploads/${fileName}`;
        
        if (i === 0) {
          // ไฟล์แรกอัพเดทใน attachment หลัก
          await connection.query(
            `UPDATE attachment SET file_name = ?, file_path = ?, modify_date = NOW() WHERE attachment_id = ?`,
            [fileName, filePath, finalAttachmentId]
          );
          attachmentIds.push(finalAttachmentId);
        } else {
          // ไฟล์อื่นๆ สร้าง attachment ใหม่
          const [newAttachment] = await connection.query(
            `INSERT INTO attachment (file_name, file_path, create_name, modify_name, create_date, modify_date) 
             VALUES (?, ?, ?, ?, NOW(), NOW())`,
            [fileName, filePath, create_name, modify_name]
          );
          attachmentIds.push(newAttachment.insertId);
        }
        
        uploadedFiles.push({
          attachment_id: i === 0 ? finalAttachmentId : attachmentIds[i],
          file_name: fileName,
          file_path: filePath
        });
      }
    }

    // บันทึกข่าว (ใช้ attachment_id หลัก)
    const insertNewsQuery = `
      INSERT INTO news (topic, content, cate_news_id, attachment_id, pin, hide, status, create_date, modify_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;
    const [newsResult] = await connection.query(insertNewsQuery, [
      topic,
      content,
      cate_news_id,
      finalAttachmentId,
      pin,
      hide,
      status
    ]);

    // ถ้ามีไฟล์หลายตัว อาจต้องสร้างตาราง news_attachments เพื่อเชื่อมโยง
    // หรือเก็บ attachment_ids อื่นๆ ในฟิลด์ JSON/TEXT
    if (attachmentIds.length > 1) {
      const additionalAttachments = attachmentIds.slice(1).join(',');
      await connection.query(
        `UPDATE news SET additional_attachments = ? WHERE news_id = ?`,
        [additionalAttachments, newsResult.insertId]
      );
    }

    await connection.commit();

    return res.status(200).json({
      message: 'เพิ่มข้อมูลข่าวสำเร็จ',
      insertedId: newsResult.insertId,
      attachment_id: finalAttachmentId,
      data: {
        id: newsResult.insertId,
        topic,
        content,
        cate_news_id,
        attachment_id: finalAttachmentId,
        all_attachment_ids: attachmentIds,
        uploaded_files: uploadedFiles,
        files_count: uploadedFiles.length,
        pin,
        hide,
        status,
        create_name,
        modify_name
      }
    });

  } catch (err) {
    await connection.rollback();
    console.error('Database error:', err);
    res.status(500).json({ 
      error: 'เกิดข้อผิดพลาดในการเพิ่มข่าว', 
      detail: err.message 
    });
  } finally {
    connection.release();
  }
};

exports.updatenews = async (req, res) => {
  const newsId = req.params.id;
  const {
    topic,
    content,
    cate_news_id
 
  } = req.body;

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // ตรวจสอบว่าข่าวมีอยู่หรือไม่
    const [existingNews] = await connection.query(
      'SELECT * FROM news WHERE id = ?',
      [newsId]
    );

    if (existingNews.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'ไม่พบข่าวที่ต้องการแก้ไข' });
    }

    // ตรวจสอบหมวดหมู่ข่าว (ถ้ามี)
    if (cate_news_id) {
      const [cateResult] = await connection.query(
        'SELECT cate_news_id FROM master_cate_news WHERE cate_news_id = ?',
        [cate_news_id]
      );

      if (cateResult.length === 0) {
        await connection.rollback();
        return res.status(400).json({ error: 'ไม่พบหมวดหมู่ข่าวที่เลือก' });
      }
    }

    // จัดการไฟล์แนบใหม่ (ถ้ามี)
    const uploadedFiles = [];
    const newAttachmentIds = [];

    if (req.files && req.files['file_name'] && req.files['file_name'].length > 0) {
      for (let i = 0; i < req.files['file_name'].length; i++) {
        const file = req.files['file_name'][i];
        const fileName = file.filename;
        const filePath = `/uploads/${fileName}`;

        // สร้าง attachment ใหม่โดยใช้ newsId ใส่ใน reference_id
        const [attachmentResult] = await connection.query(
          `INSERT INTO attachment (file_name, file_path, reference_type, reference_id, description, create_name,create_date, modify_date) 
           VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          [fileName, filePath, 'news', newsId, 'news', existingNews[0].create_name, modify_name]
        );

        newAttachmentIds.push(attachmentResult.insertId);
        uploadedFiles.push({
          attachment_id: attachmentResult.insertId,
          file_name: fileName,
          file_path: filePath
        });
      }
    }

    // อัปเดตข้อมูลข่าว
    let updateFields = [];
    let updateValues = [];

    if (topic !== undefined) {
      updateFields.push('topic = ?');
      updateValues.push(topic);
    }
    if (content !== undefined) {
      updateFields.push('content = ?');
      updateValues.push(content);
    }
    if (cate_news_id !== undefined) {
      updateFields.push('cate_news_id = ?');
      updateValues.push(cate_news_id);
    }
  

    updateFields.push('modify_date = NOW()');
    updateValues.push(newsId);

    const updateNewsQuery = `
      UPDATE news 
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `;

    const [updateResult] = await connection.query(updateNewsQuery, updateValues);

    if (updateResult.affectedRows === 0) {
      await connection.rollback();
      return res.status(400).json({ error: 'ไม่สามารถอัปเดตข่าวได้' });
    }

    // ดึงข้อมูลข่าวที่อัปเดตแล้ว พร้อมไฟล์แนบทั้งหมด
    const [updatedNews] = await connection.query(
      `SELECT n.*, 
              GROUP_CONCAT(
                CONCAT(
                  '{"attachment_id":', a.attachment_id, 
                  ',"file_name":"', IFNULL(a.file_name, ''), 
                  '","file_path":"', IFNULL(a.file_path, ''), 
                  '","create_name":"', IFNULL(a.create_name, ''), 
                  '"}'
                ) SEPARATOR ','
              ) as attachments_json
       FROM news n 
       LEFT JOIN attachment a ON n.id = a.reference_id AND a.reference_type = 'news'
       WHERE n.id = ?
       GROUP BY n.id`,
      [newsId]
    );

    // แปลง JSON string เป็น array
    let attachments = [];
    if (updatedNews[0].attachments_json) {
      try {
        const attachmentsStr = '[' + updatedNews[0].attachments_json + ']';
        attachments = JSON.parse(attachmentsStr);
      } catch (parseError) {
        console.error('Error parsing attachments JSON:', parseError);
        attachments = [];
      }
    }

    await connection.commit();

    return res.status(200).json({
      message: 'อัปเดตข้อมูลข่าวสำเร็จ',
      new_attachment_ids: newAttachmentIds,
      data: {
        id: parseInt(newsId),
        topic: updatedNews[0].topic,
        content: updatedNews[0].content,
        cate_news_id: updatedNews[0].cate_news_id,
        attachments: attachments,
        uploaded_files: uploadedFiles,
        files_count: uploadedFiles.length,
        total_attachments: attachments.length,
        create_date: updatedNews[0].create_date,
        modify_date: updatedNews[0].modify_date,
        create_name: updatedNews[0].create_name,
        modify_name: updatedNews[0].modify_name
      }
    });

  } catch (err) {
    await connection.rollback();
    console.error('Database error:', err);
    res.status(500).json({ 
      error: 'เกิดข้อผิดพลาดในการอัปเดตข่าว', 
      detail: err.message 
    });
  } finally {
    connection.release();
  }
};


exports.getNewsById = async (req, res) => {
  const { id } = req.params;

  try {
    // ตรวจสอบว่า id เป็นตัวเลขหรือไม่
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'กรุณาระบุ ID ของข่าวที่ถูกต้อง' });
    }

    // ดึงข้อมูลข่าวพื้นฐาน
    const getNewsQuery = `
      SELECT 
        n.id,
        n.topic,
        n.content,
        n.cate_news_id,
        n.pin,
        n.hide,
        n.status,
        n.create_date,
        n.modify_date,
        c.name as category_name
      FROM news n
      LEFT JOIN master_cate_news c ON n.cate_news_id = c.cate_news_id
      WHERE n.id = ?
    `;

    const [newsResult] = await pool.query(getNewsQuery, [id]);

    // ตรวจสอบว่าพบข่าวหรือไม่
    if (newsResult.length === 0) {
      return res.status(404).json({ error: 'ไม่พบข่าวที่ต้องการ' });
    }

    const newsData = newsResult[0];

    // ดึง attachments ที่ reference_id = news.id และ description = 'news'
    const attachmentQuery = `
      SELECT 
        attachment_id,
        file_name,
        file_path,
        file_type,
        create_name as attachment_create_name,
        modify_name as attachment_modify_name,
        create_date as attachment_create_date,
        modify_date as attachment_modify_date
      FROM attachment 
      WHERE reference_id = ? AND description = 'news'
      ORDER BY attachment_id ASC
    `;

    const [attachments] = await pool.query(attachmentQuery, [id]);

    // จัดรูปแบบข้อมูลที่ส่งกลับ
    const responseData = {
      id: newsData.id,
      topic: newsData.topic,
      content: newsData.content,
      cate_news_id: newsData.cate_news_id,
      category_name: newsData.category_name,
      attachments: attachments, // ส่งเป็น array ของ attachment objects
      pin: newsData.pin,
      hide: newsData.hide,
      status: newsData.status,
      create_date: newsData.create_date,
      modify_date: newsData.modify_date
    };

    return res.status(200).json({
      message: 'ดึงข้อมูลข่าวสำเร็จ',
      data: responseData
    });

  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({
      error: 'เกิดข้อผิดพลาดในการดึงข้อมูลข่าว',
      detail: err.message
    });
  }
};



exports.getnewsbyadmin = async (req, res) => {
  const sql = `
    SELECT 
      n.id,
      n.topic,
      n.content,
      n.cate_news_id,
      n.pin,
      n.pin_order,
      n.pinned_at,
      n.hide,
      n.status,
      n.create_date,
      n.modify_date,
      mc.name AS category_name
    FROM news n
    LEFT JOIN master_cate_news mc ON n.cate_news_id = mc.cate_news_id 
    ORDER BY 
      CASE WHEN n.pin = 1 THEN 0 ELSE 1 END,
      n.pin_order ASC,
      n.create_date DESC
  `;

  try {
    const [newsResults] = await pool.query(sql);

    if (newsResults.length === 0) {
      return res.status(404).send("No news found.");
    }

    // ดึง attachment สำหรับแต่ละข่าว
    const newsWithAttachments = await Promise.all(
      newsResults.map(async (news) => {
        // ดึง attachments ที่ reference_id = news.id และ description = 'news'
        const attachmentSql = `
          SELECT 
            attachment_id,
            file_name,
            file_path,
            file_type
          FROM attachment 
          WHERE reference_id = ? AND description = 'news'
          ORDER BY attachment_id ASC
        `;
        
        const [attachments] = await pool.query(attachmentSql, [news.id]);
        
        return {
          ...news,
          attachments: attachments // ส่งเป็น array ของ attachment objects
        };
      })
    );

    res.status(200).json(newsWithAttachments);
  } catch (err) {
    console.error("Error fetching news:", err);
    res.status(500).send("Error fetching news.");
  }
};

exports.getnewsbyuser = async (req, res) => {
  const sql = "SELECT * FROM news WHERE hide = 0";

  try {
    const [results] = await pool.query(sql);

    if (results.length === 0) {
      return res.status(404).send("No news found.");
    }

    res.status(200).json(results);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching news.");
  }
};

exports.hideNewsById = async (req, res) => {
  const { id } = req.params;

  try {
    // ตรวจสอบว่า id ถูกต้องหรือไม่
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'กรุณาระบุ ID ของข่าวที่ถูกต้อง' });
    }

    // อัปเดตค่า hide = 1
    const updateQuery = `UPDATE news SET hide = 1 WHERE id = ?`;
    const [result] = await pool.query(updateQuery, [id]);

    // ถ้าไม่มีการอัปเดตแถวใดเลย แสดงว่าไม่พบ ID นี้
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'ไม่พบข่าวที่ต้องการซ่อน' });
    }

    return res.status(200).json({
      message: `ซ่อนข่าว ID ${id} เรียบร้อยแล้ว`
    });

  } catch (err) {
    console.error('Database error:', err);
    return res.status(500).json({
      error: 'เกิดข้อผิดพลาดในการซ่อนข่าว',
      detail: err.message
    });
  }
};

exports.deleteNewsById = async (req, res) => {
  const { id } = req.params;

  try {
    // ตรวจสอบว่า id ถูกต้องหรือไม่
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'กรุณาระบุ ID ของข่าวที่ถูกต้อง' });
    }

    // ลบข่าวออกจากฐานข้อมูล
    const deleteQuery = `DELETE FROM news WHERE id = ?`;
    const [result] = await pool.query(deleteQuery, [id]);

    // ถ้าไม่มีการลบแถวใดเลย แสดงว่าไม่พบ ID นี้
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'ไม่พบข่าวที่ต้องการลบ' });
    }

    return res.status(200).json({
      message: `ลบข่าว ID ${id} เรียบร้อยแล้ว`
    });

  } catch (err) {
    console.error('Database error:', err);
    return res.status(500).json({
      error: 'เกิดข้อผิดพลาดในการลบข่าว',
      detail: err.message
    });
  }
};

exports.unhideNewsById = async (req, res) => {
  const { id } = req.params;

  try {
    // ตรวจสอบว่า id ถูกต้องหรือไม่
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'กรุณาระบุ ID ของข่าวที่ถูกต้อง' });
    }

    // อัปเดตค่า hide = 0
    const updateQuery = `UPDATE news SET hide = 0 WHERE id = ?`;
    const [result] = await pool.query(updateQuery, [id]);

    // ถ้าไม่มีการอัปเดตแถวใดเลย แสดงว่าไม่พบ ID นี้
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'ไม่พบข่าวที่ต้องการซ่อน' });
    }

    return res.status(200).json({
      message: `เลิกซ่อนข่าว ID ${id} เรียบร้อยแล้ว`
    });

  } catch (err) {
    console.error('Database error:', err);
    return res.status(500).json({
      error: 'เกิดข้อผิดพลาดในการซ่อนข่าว',
      detail: err.message
    });
  }
};



exports.togglePinStatus = async (req, res) => {
  const id = req.params.id;
  const { isPinned } = req.body;

  if (typeof isPinned === 'undefined' || (isPinned !== 0 && isPinned !== 1)) {
    return res.status(400).json({ success: false, message: 'Invalid isPinned value' });
  }

  try {
    let pinOrder = null;
    let pinnedAt = null;

    if (isPinned === 1) {
      // หาลำดับสูงสุดในปัจจุบัน แล้ว +1 เพื่อให้ pin ใหม่อยู่ล่างสุดของรายการ pin
      const [rows] = await pool.execute(
        'SELECT MAX(pin_order) as maxOrder FROM news WHERE pin = 1'
      );

      const maxOrder = rows[0].maxOrder || 0;
      pinOrder = maxOrder + 1;
      pinnedAt = new Date(); // ปัจจุบัน
    }

    const [result] = await pool.execute(
      `UPDATE news
       SET pin = ?, pin_order = ?, pinned_at = ?
       WHERE id = ?`,
      [isPinned, pinOrder, pinnedAt, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'News item not found' });
    }

    return res.json({ success: true, message: 'Pin status updated successfully' });
  } catch (error) {
    console.error('Error updating pin status:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
exports.pinNewsById = async (req, res) => {
  const { id } = req.params;

  try {
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'กรุณาระบุ ID ของข่าวที่ถูกต้อง' });
    }

    const updateQuery = `UPDATE news SET pin = 1 WHERE id = ?`;
    const [result] = await pool.query(updateQuery, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'ไม่พบข่าวที่ต้องการ pin' });
    }

    return res.status(200).json({ success: true, message: 'pin เรียบร้อยแล้ว' });
  } catch (err) {
    console.error('Database error:', err);
    return res.status(500).json({ error: 'เกิดข้อผิดพลาดใน pin', detail: err.message });
  }
};


exports.unpinNewsById = async (req, res) => {
  const { id } = req.params;

  try {
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'กรุณาระบุ ID ของข่าวที่ถูกต้อง' });
    }

    const updateQuery = `UPDATE news SET pin = 0 WHERE id = ?`;
    const [result] = await pool.query(updateQuery, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'ไม่พบข่าวที่ต้องการ unpin' });
    }

    return res.status(200).json({ success: true, message: 'ยกเลิก pin เรียบร้อยแล้ว' });
  } catch (err) {
    console.error('Database error:', err);
    return res.status(500).json({ error: 'เกิดข้อผิดพลาดใน unpin', detail: err.message });
  }
};


exports.deleteMultipleNewsAttachments = async (req, res) => {
  const newsId = req.params.news_id;
  const { attachment_ids } = req.body; // array ของ attachment_id

  if (!attachment_ids || !Array.isArray(attachment_ids) || attachment_ids.length === 0) {
    return res.status(400).json({ error: 'กรุณาระบุ attachment_ids ที่ต้องการลบ' });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // ตรวจสอบว่าข่าวมีอยู่หรือไม่
    const [existingNews] = await connection.query(
      'SELECT * FROM news WHERE id = ?',
      [newsId]
    );

    if (existingNews.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'ไม่พบข่าวที่ระบุ' });
    }

    // ตรวจสอบว่า attachments ทั้งหมดมีอยู่และตรงกับ news_id หรือไม่
    const placeholders = attachment_ids.map(() => '?').join(',');
    const [existingAttachments] = await connection.query(
      `SELECT * FROM attachment 
       WHERE attachment_id IN (${placeholders}) 
       AND reference_id = ? AND reference_type = ?`,
      [...attachment_ids, newsId, 'news']
    );

    if (existingAttachments.length !== attachment_ids.length) {
      await connection.rollback();
      return res.status(404).json({ 
        error: 'ไม่พบไฟล์แนบบางไฟล์หรือไฟล์แนบไม่ตรงกับข่าวที่ระบุ' 
      });
    }

    // เก็บข้อมูลไฟล์ก่อนลบ
    const deletedFiles = existingAttachments.map(att => ({
      attachment_id: att.attachment_id,
      file_name: att.file_name,
      file_path: att.file_path
    }));

    // ลบ attachments จากฐานข้อมูล
    const [deleteResult] = await connection.query(
      `DELETE FROM attachment 
       WHERE attachment_id IN (${placeholders}) 
       AND reference_id = ? AND reference_type = ?`,
      [...attachment_ids, newsId, 'news']
    );

    if (deleteResult.affectedRows === 0) {
      await connection.rollback();
      return res.status(400).json({ error: 'ไม่สามารถลบไฟล์แนบได้' });
    }

    // อัปเดต modify_date ของข่าว
    await connection.query(
      'UPDATE news SET modify_date = NOW() WHERE id = ?',
      [newsId]
    );

    // ดึงข้อมูลไฟล์แนบที่เหลืออยู่
    const [remainingAttachments] = await connection.query(
      `SELECT attachment_id, file_name, file_path, create_name, create_date
       FROM attachment 
       WHERE reference_id = ? AND reference_type = ?
       ORDER BY create_date DESC`,
      [newsId, 'news']
    );

    await connection.commit();

    return res.status(200).json({
      message: `ลบไฟล์แนบสำเร็จ ${deleteResult.affectedRows} ไฟล์`,
      deleted_files: deletedFiles,
      deleted_count: deleteResult.affectedRows,
      remaining_attachments: remainingAttachments,
      remaining_count: remainingAttachments.length
    });

  } catch (err) {
    await connection.rollback();
    console.error('Database error:', err);
    res.status(500).json({ 
      error: 'เกิดข้อผิดพลาดในการลบไฟล์แนบ', 
      detail: err.message 
    });
  } finally {
    connection.release();
  }
};
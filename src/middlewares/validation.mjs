// Перевіряємо обов'язкові поля до передачі запиту контролеру
function validateTextField(field, maxLength) {
  return (req, res, next) => {
    const value = req.body?.[field]

    if (typeof value !== 'string') {
      return res.status(400).send('Bad Request')
    }

    const normalized = value.trim()

    if (!normalized || normalized.length > maxLength) {
      return res.status(400).send('Bad Request')
    }

    req.body[field] = normalized
    next()
  }
}

export const validateUserData = validateTextField('name', 100)
export const validateArticleData = validateTextField('title', 200)

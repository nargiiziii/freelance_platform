// import user from '../models/user.js';

// // Пополнение баланса
// export const topUpBalance = async (req, res) => {
//   try {
//     const userId = req.user._id;  // предполагается, что в authMiddleware записывается user
//     const { amount } = req.body;

//     if (!amount || amount <= 0) {
//       return res.status(400).json({ message: 'Неверная сумма для пополнения' });
//     }

//     const user = await user.findById(userId);
//     if (!user) {
//       return res.status(404).json({ message: 'Пользователь не найден' });
//     }

//     user.balance = (user.balance || 0) + amount;
//     await user.save();

//     res.json({ message: 'Баланс успешно пополнен', balance: user.balance });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Ошибка сервера при пополнении баланса' });
//   }
// };

// // Получить баланс пользователя (опционально)
// export const getBalance = async (req, res) => {
//   try {
//     const userId = req.user._id;

//     const user = await user.findById(userId).select('balance');
//     if (!user) {
//       return res.status(404).json({ message: 'Пользователь не найден' });
//     }

//     res.json({ balance: user.balance || 0 });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Ошибка сервера при получении баланса' });
//   }
// };

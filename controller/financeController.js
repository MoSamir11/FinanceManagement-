const { response } = require("express");
const finance = require("../modal/finance");
var jwt = require("jsonwebtoken");

exports.addExpense = async (req, res) => {
    const { amount, type, category, note } = JSON.parse(JSON.stringify(req.body));
    if (!amount || !type || !category) {
        return res.status(400).json({
            message: "amount, type and category are required"
        });
    }

    // ✅ Type validation
    if (typeof amount !== "number" || amount <= 0) {
        return res.status(400).json({
            message: "amount must be a positive number"
        });
    }

    if (!["income", "expense"].includes(type)) {
        return res.status(400).json({
            message: "type must be either 'income' or 'expense'"
        });
    }

    if (typeof category !== "string" || category.trim() === "") {
        return res.status(400).json({
            message: "category must be a valid string"
        });
    }

    if (note && typeof note !== "string") {
        return res.status(400).json({
            message: "note must be a string"
        });
    }
    let data = {
        amount, type, category, note, createdOn: Date.now()
    }
    try {
        const createResponse = await finance.insertOne(data);
        if (createResponse) {
            res.status(200).json({ message: "Product Added Successfully !" })
        } else {
            res.status(400).json({ message: "Something Went Wrong !" })
        }
    } catch (e) {
        res.status(400).json({ message: e })
    }
}

exports.getExpenses = async (req, res) => {
    let page = req.query.page || 1; 
    let limit = req.query.limit;
    const skip = (page - 1) * limit;
    console.log('55-->',page, limit);
    let {type} = JSON.parse(JSON.stringify(req.body));
    console.log('58-->',type);
    
    try {
        const createResponse = await finance.find({type:type,category:category}).sort({createdOn: -1}).skip(skip).limit(limit);
        if (createResponse) {
            res.status(200).json({ isSuccess: true, data: createResponse, length: createResponse.length })
        } else {
            res.status(400).json({ message: "Something Went Wrong !" })
        }
    } catch (e) {
        res.status(400).json({ message: e })
    }
}

exports.deleteExpense = async (req, res) => {
    let { id } = JSON.parse(JSON.stringify(req.body));
    console.log('35-->', id);

    try {
        const createResponse = await finance.deleteOne({ _id: id });
        if (createResponse) {
            res.status(200).json({ isSuccess: true, message: "Product Deleted Successfully !" })
        } else {
            res.status(400).json({ message: "Something Went Wrong !" })
        }
    } catch (e) {
        res.status(400).json({ message: e })
    }
}

exports.updateExpense = async (req, res) => {
    let { id, amount, type, category, note } = JSON.parse(JSON.stringify(req.body));
    console.log('35-->', id);
    if (!amount || !type || !category || !id) {
        return res.status(400).json({
            message: "id, amount, type and category are required"
        });
    }

    // ✅ Type validation
    if (typeof amount !== "number" || amount <= 0) {
        return res.status(400).json({
            message: "amount must be a positive number"
        });
    }

    if (!["income", "expense"].includes(type)) {
        return res.status(400).json({
            message: "type must be either 'income' or 'expense'"
        });
    }

    if (typeof category !== "string" || category.trim() === "") {
        return res.status(400).json({
            message: "category must be a valid string"
        });
    }

    if (note && typeof note !== "string") {
        return res.status(400).json({
            message: "note must be a string"
        });
    }
    try {
        const createResponse = await finance.findByIdAndUpdate({ _id: id }, { $set: { amount, type, category, note, updatedOn: Date.now() } });
        if (createResponse) {
            res.status(200).json({ isSuccess: true, message: "Product Updated Successfully !" })
        } else {
            res.status(400).json({ message: "Something Went Wrong !" })
        }
    } catch (e) {
        res.status(400).json({ message: e })
    }
}

exports.category = async (req, res) => {

    try {
        const response = await finance.distinct("category");
        if (response) {
            res.status(200).json({ isSuccess: true, data: response, total: response.length })
        } else {
            res.status(400).json({ message: "Something Went Wrong !" })
        }
    } catch (e) {
        res.status(400).json({ message: e })
    }
}

exports.dashboard = async (req, res) => {

    try {
        const dashboard = await finance.aggregate([
            {
                $facet: {

                    // ✅ 1. Total Income
                    totalIncome: [
                        { $match: { type: "income" } },
                        { $group: { _id: null, total: { $sum: "$amount" } } }
                    ],

                    // ✅ 2. Total Expense
                    totalExpense: [
                        { $match: { type: "expense" } },
                        { $group: { _id: null, total: { $sum: "$amount" } } }
                    ],

                    // ✅ 3. Category-wise totals
                    categoryTotals: [
                        {
                            $group: {
                                _id: "$category",
                                total: { $sum: "$amount" }
                            }
                        },
                        {
                            $project: {
                                _id: 0,
                                category: "$_id",
                                total: 1
                            }
                        }
                    ],

                    // ✅ 4. Recent Activity (last 5)
                    recent: [
                        { $sort: { createdOn: -1 } },
                        { $limit: 5 }
                    ],

                    // ✅ 5. Monthly Trends
                    monthlyTrends: [
                        {
                            $group: {
                                _id: {
                                    year: { $year: { $toDate: "$createdOn" } },
                                    month: { $month: { $toDate: "$createdOn" } }
                                },
                                total: { $sum: "$amount" }
                            }
                        },
                        { $sort: { "_id.year": 1, "_id.month": 1 } }
                    ]

                }
            }
        ]);
        const data = dashboard[0];

        const totalIncome = data.totalIncome[0]?.total || 0;
        const totalExpense = data.totalExpense[0]?.total || 0;

        const response = {
            totalIncome,
            totalExpense,
            netBalance: totalIncome - totalExpense,
            categoryTotals: data.categoryTotals,
            recent: data.recent,
            monthlyTrends: data.monthlyTrends
        };

        if (response) {
            res.status(200).json({ isSuccess: true, data: response })
        } else {
            res.status(400).json({ message: "Something Went Wrong !" })
        }
    } catch (e) {
        res.status(400).json({ message: e })
    }
}
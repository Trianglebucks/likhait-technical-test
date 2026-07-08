require 'rails_helper'

RSpec.describe Expense, type: :model do
  let(:category) { Category.create!(name: "Food") }

  describe "validations" do
    it "is valid with a description, amount, date, and category" do
      expense = Expense.new(description: "Lunch", amount: 10.50, date: Date.today, category: category)
      expect(expense).to be_valid
    end

    it "is invalid without a description" do
      expense = Expense.new(description: "", amount: 10.50, date: Date.today, category: category)
      expect(expense).not_to be_valid
      expect(expense.errors[:description]).to include("can't be blank")
    end

    it "is invalid without an amount" do
      expense = Expense.new(description: "Lunch", amount: nil, date: Date.today, category: category)
      expect(expense).not_to be_valid
      expect(expense.errors[:amount]).to include("can't be blank")
    end

    it "is invalid with a non-positive amount" do
      expense = Expense.new(description: "Lunch", amount: -1.00, date: Date.today, category: category)
      expect(expense).not_to be_valid
      expect(expense.errors[:amount]).to include("must be greater than 0")

      expense.amount = 0.00
      expect(expense).not_to be_valid
      expect(expense.errors[:amount]).to include("must be greater than 0")
    end

    it "is invalid without a date" do
      expense = Expense.new(description: "Lunch", amount: 10.50, date: nil, category: category)
      expect(expense).not_to be_valid
      expect(expense.errors[:date]).to include("can't be blank")
    end

    it "is invalid with a future date" do
      expense = Expense.new(description: "Lunch", amount: 10.50, date: Date.tomorrow, category: category)
      expect(expense).not_to be_valid
      expect(expense.errors[:date]).to include("can't be in the future")
    end

    it "is valid with today's date" do
      expense = Expense.new(description: "Lunch", amount: 10.50, date: Date.today, category: category)
      expect(expense).to be_valid
    end

    it "is valid with a past date" do
      expense = Expense.new(description: "Lunch", amount: 10.50, date: Date.yesterday, category: category)
      expect(expense).to be_valid
    end

    it "is invalid without a category" do
      expense = Expense.new(description: "Lunch", amount: 10.50, date: Date.today, category: nil)
      expect(expense).not_to be_valid
      expect(expense.errors[:category]).to include("must exist")
    end
  end
end

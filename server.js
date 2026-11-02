
const express = require('express');
const app = express();
app.use(express.json());

let books = [];

// 1. Add Book
app.post('/api/books', (req, res) => {
    const { id, title, author, category, quantity } = req.body;

    if (!id || !title || !author || !category ||
        !Number.isInteger(quantity) || quantity <= 0)
        return res.status(400).json({ message: "Invalid details" });

    if (books.find(b => b.id == id))
        return res.status(409).json({ message: "Duplicate ID" });

    const book = { id, title, author, category, quantity, available: quantity };
    books.push(book);

    res.status(201).json({ message: "Book Added", data: book });
});

// 2. Get All Books
app.get('/api/books', (req, res) => {
    res.json({ message: "All Books", data: books });
});

// 3. Get Book by ID
app.get('/api/books/:id', (req, res) => {
    const b = books.find(b => b.id == req.params.id);
    b ? res.json(b) : res.status(404).json({ message: "Not Found" });
});

// 4. Update Book
app.put('/api/books/:id', (req, res) => {
    const b = books.find(b => b.id == req.params.id);
    if (!b) return res.status(404).json({ message: "Not Found" });

    const { title, author, category, quantity } = req.body;

    if (title !== undefined) b.title = title;
    if (author !== undefined) b.author = author;
    if (category !== undefined) b.category = category;

    if (quantity !== undefined) {
        let issued = b.quantity - b.available;
        if (!Number.isInteger(quantity) || quantity < issued)
            return res.status(400).json({ message: "Invalid quantity" });
        b.quantity = quantity;
        b.available = quantity - issued;
    }

    res.json({ message: "Updated", data: b });
});

// 5. Delete Book
app.delete('/api/books/:id', (req, res) => {
    const i = books.findIndex(b => b.id == req.params.id);
    if (i < 0) return res.status(404).json({ message: "Not Found" });

    if (books[i].available < books[i].quantity)
        return res.status(400).json({ message: "Book Issued" });

    const b = books.splice(i, 1);
    res.json({ message: "Deleted", data: b[0] });
});

// 6. Search Book
app.get('/api/search', (req, res) => {
    const s = (req.query.q || '').toLowerCase();
    const result = books.filter(b =>
        b.title.toLowerCase().includes(s) ||
        b.author.toLowerCase().includes(s));
    res.json({ data: result });
});

// 7. Issue Book
app.post('/api/books/:id/issue', (req, res) => {
    const b = books.find(b => b.id == req.params.id);
    if (!b) return res.status(404).json({ message: "Not Found" });
    if (b.available <= 0)
        return res.status(400).json({ message: "Not Available" });

    b.available--;
    res.json({ message: "Issued", data: b });
});

// 8. Return Book
app.post('/api/books/:id/return', (req, res) => {
    const b = books.find(b => b.id == req.params.id);
    if (!b) return res.status(404).json({ message: "Not Found" });
    if (b.available >= b.quantity)
        return res.status(400).json({ message: "Not Issued" });

    b.available++;
    res.json({ message: "Returned", data: b });
});

app.listen(3000, () => console.log("Server running on 3000"));

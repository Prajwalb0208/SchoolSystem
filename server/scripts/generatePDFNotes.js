const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const notesDir = path.join(__dirname, '../notes');
if (!fs.existsSync(notesDir)) {
  fs.mkdirSync(notesDir, { recursive: true });
}

const languages = [
  {
    name: 'C',
    filename: 'C.pdf',
    content: {
      title: 'C Programming - Intermediate Key Concepts',
      concepts: [
        'Pointers: Memory addresses, pointer arithmetic, function pointers',
        'Dynamic Memory Allocation: malloc, calloc, realloc, free',
        'Structures: User-defined data types, nested structures, typedef',
        'File Handling: fopen, fread, fwrite, fclose operations',
        'Preprocessor Directives: #define, #include, macros, conditional compilation',
        'Function Parameters: Pass by value vs pass by reference',
        'Arrays and Strings: Multi-dimensional arrays, string manipulation',
        'Memory Management: Stack vs heap, memory leaks, dangling pointers'
      ]
    }
  },
  {
    name: 'C++',
    filename: 'Cpp.pdf',
    content: {
      title: 'C++ Programming - Intermediate Key Concepts',
      concepts: [
        'Object-Oriented Programming: Classes, objects, encapsulation',
        'Inheritance: Single, multiple, multilevel, hierarchical inheritance',
        'Polymorphism: Function overloading, operator overloading, virtual functions',
        'Templates: Function templates, class templates, STL containers',
        'Exception Handling: try, catch, throw, standard exceptions',
        'STL Containers: vector, list, map, set, queue, stack',
        'Smart Pointers: unique_ptr, shared_ptr, weak_ptr',
        'Namespaces: Using namespaces, namespace aliases, std namespace'
      ]
    }
  },
  {
    name: 'Java',
    filename: 'Java.pdf',
    content: {
      title: 'Java Programming - Intermediate Key Concepts',
      concepts: [
        'Object-Oriented Principles: Classes, objects, abstraction, encapsulation',
        'Inheritance: extends keyword, super keyword, method overriding',
        'Polymorphism: Method overloading, runtime polymorphism, interfaces',
        'Collections Framework: ArrayList, LinkedList, HashMap, HashSet',
        'Exception Handling: try-catch-finally, checked vs unchecked exceptions',
        'Multi-threading: Thread class, Runnable interface, synchronization',
        'Generics: Generic classes, methods, wildcards, type erasure',
        'Lambda Expressions: Functional interfaces, method references'
      ]
    }
  },
  {
    name: 'Python',
    filename: 'Python.pdf',
    content: {
      title: 'Python Programming - Intermediate Key Concepts',
      concepts: [
        'Object-Oriented Programming: Classes, inheritance, polymorphism',
        'Data Structures: Lists, tuples, dictionaries, sets, comprehensions',
        'Decorators: Function decorators, class decorators, @property',
        'Generators: Generator functions, yield keyword, generator expressions',
        'Exception Handling: try-except-finally, custom exceptions, raise',
        'Modules and Packages: Import statements, __init__.py, namespace packages',
        'File Operations: File reading/writing, context managers (with statement)',
        'Lambda Functions: Anonymous functions, map, filter, reduce'
      ]
    }
  }
];

languages.forEach(lang => {
  const doc = new PDFDocument();
  const filePath = path.join(notesDir, lang.filename);
  doc.pipe(fs.createWriteStream(filePath));

  // Header
  doc.fontSize(20).text(lang.content.title, { align: 'center' });
  doc.moveDown();

  // Content
  doc.fontSize(12);
  lang.content.concepts.forEach((concept, index) => {
    doc.text(`${index + 1}. ${concept}`, { align: 'left' });
    doc.moveDown(0.5);
  });

  // Footer
  doc.moveDown();
  doc.fontSize(10).text('This is a one-page summary of intermediate key concepts.', {
    align: 'center',
    italic: true
  });

  doc.end();
  console.log(`Generated ${lang.filename}`);
});

console.log('All PDF notes generated successfully!');


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
        {
          title: 'Pointers',
          content: `Pointers store memory addresses. Declaration: int *ptr;\n- & operator gets address: ptr = &var;\n- * operator dereferences: *ptr = 10;\n- Pointer arithmetic: ptr++, ptr--\n- Function pointers: int (*func)(int, int);`
        },
        {
          title: 'Dynamic Memory Allocation',
          content: `malloc(size) - allocates memory\ncalloc(num, size) - allocates and initializes to zero\nrealloc(ptr, size) - reallocates memory\nfree(ptr) - deallocates memory\nAlways free allocated memory to prevent leaks.`
        },
        {
          title: 'Structures',
          content: `User-defined data types grouping variables:\nstruct Person {\n    char name[50];\n    int age;\n};\n- Access members with . operator\n- Structure pointers use -> operator`
        },
        {
          title: 'File Handling',
          content: `fopen(filename, mode) - opens file\nfread/fwrite - binary read/write\nfprintf/fscanf - formatted I/O\nfclose - closes file\nModes: "r" read, "w" write, "a" append`
        },
        {
          title: 'Preprocessor Directives',
          content: `#define MACRO value - defines macro\n#include <header> - includes header\n#ifdef/#ifndef - conditional compilation\n#pragma - compiler-specific instructions`
        }
      ]
    }
  },
  {
    name: 'C++',
    filename: 'Cpp.pdf',
    content: {
      title: 'C++ Programming - Intermediate Key Concepts',
      concepts: [
        {
          title: 'Object-Oriented Programming',
          content: `Classes encapsulate data and functions:\nclass MyClass {\nprivate:\n    int data;\npublic:\n    void setData(int d) { data = d; }\n};\n- Encapsulation protects data\n- Objects are instances of classes`
        },
        {
          title: 'Inheritance',
          content: `Derived classes inherit from base:\nclass Derived : public Base {\n    // Derived class code\n};\n- public, protected, private inheritance\n- Constructor chaining with : Base()\n- virtual functions enable polymorphism`
        },
        {
          title: 'STL Containers',
          content: `vector<int> - dynamic array\nlist<int> - doubly linked list\nmap<string, int> - key-value pairs\nset<int> - unique sorted elements\nqueue<T>, stack<T> - FIFO/LIFO structures\nUse iterators to traverse containers`
        },
        {
          title: 'Templates',
          content: `Generic programming with templates:\ntemplate<typename T>\nT max(T a, T b) {\n    return (a > b) ? a : b;\n}\n- Function templates\n- Class templates\n- Template specialization`
        },
        {
          title: 'Exception Handling',
          content: `try { /* code */ }\ncatch (exception& e) { /* handle */ }\nthrow exception();\n- Standard exceptions: runtime_error, logic_error\n- Custom exception classes\n- RAII for resource management`
        }
      ]
    }
  },
  {
    name: 'Java',
    filename: 'Java.pdf',
    content: {
      title: 'Java Programming - Intermediate Key Concepts',
      concepts: [
        {
          title: 'Object-Oriented Principles',
          content: `Classes define objects:\npublic class MyClass {\n    private int data;\n    public void setData(int d) {\n        this.data = d;\n    }\n}\n- Encapsulation with private/public\n- this keyword references current object\n- Constructors initialize objects`
        },
        {
          title: 'Inheritance & Polymorphism',
          content: `class Child extends Parent {\n    @Override\n    void method() { /* override */ }\n}\n- extends keyword for inheritance\n- @Override annotation\n- super keyword calls parent\n- Method overriding and overloading`
        },
        {
          title: 'Collections Framework',
          content: `ArrayList<T> - dynamic array\nLinkedList<T> - linked list\nHashMap<K, V> - hash table\nHashSet<T> - unique elements\n- Generics: List<String> list\n- Enhanced for loop: for(String s : list)\n- Collections.sort() for sorting`
        },
        {
          title: 'Exception Handling',
          content: `try {\n    // risky code\n} catch (Exception e) {\n    // handle\n} finally {\n    // cleanup\n}\n- Checked vs unchecked exceptions\n- throw new Exception("message")\n- Custom exception classes`
        },
        {
          title: 'Lambda Expressions',
          content: `Functional interfaces:\nPredicate<T>, Function<T,R>, Consumer<T>\nLambda syntax:\nlist.forEach(x -> System.out.println(x));\nMethod references:\nlist.forEach(System.out::println)\n- Stream API for collections`
        }
      ]
    }
  },
  {
    name: 'Python',
    filename: 'Python.pdf',
    content: {
      title: 'Python Programming - Intermediate Key Concepts',
      concepts: [
        {
          title: 'Data Structures',
          content: `Lists: [1, 2, 3] - mutable, ordered\nTuples: (1, 2, 3) - immutable\nDictionaries: {'key': 'value'} - key-value\nSets: {1, 2, 3} - unique elements\n- List comprehensions: [x*2 for x in range(10)]\n- Dictionary comprehensions\n- Slicing: list[1:4]`
        },
        {
          title: 'Object-Oriented Programming',
          content: `class MyClass:\n    def __init__(self, value):\n        self.value = value\n    def method(self):\n        return self.value\n- self parameter in methods\n- __init__ constructor\n- Inheritance: class Child(Parent)\n- Magic methods: __str__, __repr__`
        },
        {
          title: 'Decorators & Generators',
          content: `Decorators modify functions:\n@decorator\ndef func(): pass\n\nGenerators use yield:\ndef generator():\n    yield 1\n    yield 2\n- Generator expressions: (x*2 for x in range(10))\n- @property decorator\n- Context managers with statement`
        },
        {
          title: 'Exception Handling',
          content: `try:\n    # code\nexcept ExceptionType as e:\n    # handle\nfinally:\n    # cleanup\n- Multiple except clauses\n- raise Exception("message")\n- Custom exceptions\n- Exception hierarchy`
        },
        {
          title: 'Advanced Features',
          content: `Lambda functions: lambda x: x*2\nmap(), filter(), reduce()\nModules and packages\n- import statement\n- __init__.py for packages\n- from module import function\n- Virtual environments (venv)`
        }
      ]
    }
  }
];

languages.forEach(lang => {
  const doc = new PDFDocument({ margin: 50 });
  const filePath = path.join(notesDir, lang.filename);
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  // Header
  doc.fontSize(24)
     .font('Helvetica-Bold')
     .text(lang.content.title, { align: 'center' });
  doc.moveDown(2);

  // Content
  doc.fontSize(12)
     .font('Helvetica');
  
  lang.content.concepts.forEach((concept, index) => {
    // Concept title
    doc.fontSize(16)
       .font('Helvetica-Bold')
       .text(`${index + 1}. ${concept.title}`, { underline: true });
    doc.moveDown(0.5);
    
    // Concept content
    doc.fontSize(11)
       .font('Helvetica')
       .text(concept.content, {
         align: 'left',
         lineGap: 3
       });
    
    doc.moveDown(1.5);
    
    // Check if we need a new page
    if (doc.y > 700) {
      doc.addPage();
    }
  });

  // Footer
  doc.moveDown();
  doc.fontSize(9)
     .font('Helvetica-Oblique')
     .fillColor('gray')
     .text('This is a one-page summary of intermediate key concepts for quick reference.', {
       align: 'center'
     });

  doc.end();
  console.log(`Generated ${lang.filename}`);
});

console.log('All PDF notes generated successfully with real content!');

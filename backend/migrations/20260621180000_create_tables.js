exports.up = function(knex) {
  return knex.schema
    
    .createTable('users', table => {
      table.increments('id').primary();
      table.string('email').unique().notNullable();
      table.string('password_hash').notNullable();
      table.string('role').notNullable(); 
      table.timestamps(true, true);
    })
    
    .createTable('companies', table => {
      table.increments('id').primary();
      table.string('name').notNullable();
      table.string('website');
      table.string('logo_url');
      table.text('description');
      table.string('location');
      table.string('industry');
      table.string('status').defaultTo('pending'); 
      table.timestamp('created_at').defaultTo(knex.fn.now());
    })
    
    .createTable('students', table => {
      table.increments('id').primary();
      table.integer('user_id').unsigned().unique().notNullable()
        .references('id').inTable('users').onDelete('CASCADE');
      table.string('name').notNullable();
      table.string('usn').unique().notNullable();
      table.string('branch').notNullable();
      table.float('cgpa');
      table.text('skills'); 
      table.string('resume_url');
      table.text('resume_text');
      table.text('certifications'); 
      table.text('projects'); 
      table.timestamp('created_at').defaultTo(knex.fn.now());
    })
    
    .createTable('recruiters', table => {
      table.increments('id').primary();
      table.integer('user_id').unsigned().unique().notNullable()
        .references('id').inTable('users').onDelete('CASCADE');
      table.integer('company_id').unsigned()
        .references('id').inTable('companies').onDelete('SET NULL');
      table.string('name').notNullable();
      table.string('phone');
      table.timestamp('created_at').defaultTo(knex.fn.now());
    })
    
    .createTable('jobs', table => {
      table.increments('id').primary();
      table.integer('company_id').unsigned().notNullable()
        .references('id').inTable('companies').onDelete('CASCADE');
      table.string('title').notNullable();
      table.text('description');
      table.text('requirements'); 
      table.string('location');
      table.string('job_type').defaultTo('full-time'); 
      table.string('salary'); 
      table.integer('posted_by').unsigned()
        .references('id').inTable('recruiters').onDelete('SET NULL');
      table.timestamps(true, true);
    })
    
    .createTable('applications', table => {
      table.increments('id').primary();
      table.integer('student_id').unsigned().notNullable()
        .references('id').inTable('students').onDelete('CASCADE');
      table.integer('job_id').unsigned().notNullable()
        .references('id').inTable('jobs').onDelete('CASCADE');
      table.string('status').defaultTo('applied'); 
      table.string('resume_url');
      table.float('match_score');
      table.text('screening_feedback');
      table.timestamp('applied_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
      table.unique(['student_id', 'job_id']); 
    })
    
    .createTable('interviews', table => {
      table.increments('id').primary();
      table.integer('application_id').unsigned().notNullable()
        .references('id').inTable('applications').onDelete('CASCADE');
      table.string('scheduled_at').notNullable();
      table.integer('duration_minutes').defaultTo(30);
      table.string('type').defaultTo('technical'); 
      table.string('location');
      table.text('notes');
      table.string('status').defaultTo('scheduled'); 
      table.timestamp('created_at').defaultTo(knex.fn.now());
    })
    
    .createTable('placement_reports', table => {
      table.increments('id').primary();
      table.string('academic_year').notNullable();
      table.integer('total_students').defaultTo(0);
      table.integer('placed_students').defaultTo(0);
      table.float('average_package').defaultTo(0.0);
      table.float('highest_package').defaultTo(0.0);
      table.integer('top_recruiter_id').unsigned()
        .references('id').inTable('companies').onDelete('SET NULL');
      table.timestamp('created_at').defaultTo(knex.fn.now());
    })
    
    .createTable('notifications', table => {
      table.increments('id').primary();
      table.integer('user_id').unsigned().notNullable()
        .references('id').inTable('users').onDelete('CASCADE');
      table.string('title').notNullable();
      table.text('message').notNullable();
      table.string('type').defaultTo('info'); 
      table.boolean('is_read').defaultTo(false);
      table.timestamp('created_at').defaultTo(knex.fn.now());
    })
    
    .createTable('activity_logs', table => {
      table.increments('id').primary();
      table.integer('user_id').unsigned()
        .references('id').inTable('users').onDelete('SET NULL');
      table.string('action').notNullable();
      table.text('details');
      table.timestamp('created_at').defaultTo(knex.fn.now());
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('activity_logs')
    .dropTableIfExists('notifications')
    .dropTableIfExists('placement_reports')
    .dropTableIfExists('interviews')
    .dropTableIfExists('applications')
    .dropTableIfExists('jobs')
    .dropTableIfExists('recruiters')
    .dropTableIfExists('students')
    .dropTableIfExists('companies')
    .dropTableIfExists('users');
};
